import { Mat4, Vec3, vec4 } from 'wgpu-matrix';
import { PassCtx } from '../passCtx.ts';
import {
  dgr2rad,
  getModelViewProjectionMatrix,
  projectPoint,
} from '../../utils/index.ts';
import { BoundingSphere, Bounds3d } from '../../utils/calcBounds.ts';
import { CAMERA_CFG, CONFIG } from '../../constants.ts';
import {
  NaniteObject,
  NaniteMeshletTreeNode,
} from '../../scene/naniteObject.ts';
import { NaniteVisibilityBufferCPU } from './types.ts';
import { Frustum } from '../../utils/frustum.ts';

/**
 * 'rendered' - this is the correct level to render
 * 'check-children' - children have more appropriate LOD
 */
export enum NaniteVisibilityStatus {
  RENDERED,
  CHECK_CHILDREN,
}

export function calcNaniteMeshletsVisibility(
  ctx: PassCtx,
  cotHalfFov: number,
  modelMat: Mat4,
  naniteObject: NaniteObject
): number {
  // check: entire instance is visible
  if (!checkIsInsideFrustum(ctx.cameraFrustum, modelMat, naniteObject.bounds)) {
    return 0;
  }

  const meshletsToCheck = [...naniteObject.roots];
  const visibilityBuffer = naniteObject.naniteVisibilityBufferCPU;
  visibilityBuffer.prepareForDraw();
  const getProjectedError = createErrorMetric(
    ctx,
    cotHalfFov,
    visibilityBuffer,
    modelMat
  );

  while (meshletsToCheck.length > 0) {
    // depth-first seems better as it has shorter avg $meshletsToCheck length.
    // const meshlet = meshletsToCheck.shift()!; // remove 1st from queue - breadth first
    const meshlet = meshletsToCheck.pop()!; // remove last from queue - depth first
    visibilityBuffer.setVisited(meshlet.id);

    // if (checkIsBackface(ctx, modelMat, meshlet)) {
    // culledCount += 1;
    // continue;
    // }

    const status = getVisibilityStatus(getProjectedError, meshlet);

    if (status === NaniteVisibilityStatus.RENDERED) {
      // skip children - we are at the correct cut-off level
      visibilityBuffer.setDrawn(meshlet);
    } else if (status === NaniteVisibilityStatus.CHECK_CHILDREN) {
      // check lower levels of LOD tree
      for (let i = 0; i < meshlet.createdFrom.length; i++) {
        const m = meshlet.createdFrom[i];
        if (m && !visibilityBuffer.wasVisited(m.id)) {
          visibilityBuffer.setVisited(meshlet.id);
          meshletsToCheck.push(m);
        }
      }
    }
  }

  // console.log({ visitedMeshlets }); // debug how far the tree we went
  return visibilityBuffer.drawnMeshletsCount;
}

const TMP_CACHED_VEC4 = vec4.create();

function checkIsInsideFrustum(
  frustum: Frustum,
  modelMat: Mat4,
  bounds: Bounds3d
): boolean {
  if (!CONFIG.cullingMeshlets.frustumCulling) return true;

  TMP_CACHED_VEC4[0] = bounds.sphere.center[0];
  TMP_CACHED_VEC4[1] = bounds.sphere.center[1];
  TMP_CACHED_VEC4[2] = bounds.sphere.center[2];
  TMP_CACHED_VEC4[3] = 1;
  const sphereWorldSpace = projectPoint(
    modelMat,
    TMP_CACHED_VEC4,
    TMP_CACHED_VEC4
  );
  sphereWorldSpace[3] = bounds.sphere.radius;
  return frustum.isInside(sphereWorldSpace);
}

/** WARNING: NOT FINISHED! SEE NOTE IN `src/constants.ts` for reasons and remaining scope. */
/*
function checkIsBackface(
  ctx: PassCtx,
  _modelMat: Mat4,
  meshlet: NaniteMeshletTreeNode
) {
  const bounds = meshlet.ownBounds;
  if (!CONFIG.nanite.render.useSoftwareBackfaceCull || !bounds) return false;

  const negate = (v: Vec3, i: number) => {
    v[i] = -v[i];
  };
  const cam = ctx.cameraPositionWorldSpace;
  negate(cam, 0); // see camera.ts for similar ops
  negate(cam, 1);
  negate(cam, 2);

  // TODO [IGNORE] world space position? Or bring camera into model space pos? invModelMatrix * cameraPos
  const cam2MeshletDir = vec3.normalize([
    bounds.coneApex[0] - cam[0],
    bounds.coneApex[1] - cam[1],
    bounds.coneApex[2] - cam[2],
  ]);

  // TODO [IGNORE] return dot(center - camera_position, cone_axis) >= cone_cutoff * length(center - camera_position) + radius;
  //      https://github.com/zeux/niagara/blob/master/src/shaders/math.h
  const angle = vec3.dot(cam2MeshletDir, bounds.coneApex);
  return angle >= bounds.coneCutoff;
}*/

/**
 * Returns visiblity status so we can skip processing children.
 *
 * Draw a cluster when (https://youtu.be/eviSykqSUUw?si=s7B8TvJxOKeWxLBP&t=1389):
 * - Parent error is too high
 * - Our error is small enough
 *
 * Render condition (https://youtu.be/eviSykqSUUw?si=67d_rFjnMYQOBGB3&t=1537):
 * `ParentError > threshold && ClusterError <= threshold`
 * This is used in non-parellel from-root rendering. On GPU, when going from bottom,
 * use: isCulled = `parentError <= threshold`, which decide if we are skipped in favour of parent.
 */
export function getVisibilityStatus(
  getProjectedError: ReturnType<typeof createErrorMetric>,
  meshlet: NaniteMeshletTreeNode
): NaniteVisibilityStatus {
  // prettier-ignore
  const clusterError = getProjectedError(meshlet.sharedSiblingsBounds, meshlet.maxSiblingsError);
  // prettier-ignore
  const parentError = getProjectedError(meshlet.parentBounds, meshlet.parentError);

  const threshold = CONFIG.nanite.render.pixelThreshold; // in pixels
  // TBH we already checked parentError whn traversing the tree, so not needed. Leaving for readability
  const shouldRenderThisExactMeshlet =
    parentError > threshold && clusterError <= threshold;

  // const dbgVsThr = (a: number) => (a > threshold ? 'GREATER' : 'LESSER(OK)');
  // console.log("CMP: ", {id:meshlet.id, parent: dbgVsThr(parentError), cluster: dbgVsThr(clusterError), }); // prettier-ignore
  return shouldRenderThisExactMeshlet
    ? NaniteVisibilityStatus.RENDERED
    : NaniteVisibilityStatus.CHECK_CHILDREN;
}

/**
 * Projected error in pixels (https://stackoverflow.com/a/21649403).
 * From Federico Ponchio's "Multiresolution structures for interactive
 * visualization of very large 3D datasets":
 *
 * > 3.6.1 Screen Space Error Saturation
 * >
 * > "We use the screen projection error E which is simply the projection of the model space error λ on screen"
 */
export function createErrorMetric(
  ctx: PassCtx,
  cotHalfFov: number,
  visibilityBuffer: NaniteVisibilityBufferCPU,
  modelMat: Mat4
) {
  const mvpMatrix = getModelViewProjectionMatrix(
    modelMat,
    ctx.viewMatrix,
    ctx.projMatrix,
    visibilityBuffer.mvpMatrix
  );
  const screenHeight = ctx.viewport.height;

  return function getProjectedError(
    bounds: BoundingSphere | undefined,
    errorWorldSpace: number
  ) {
    // WARNING: .parentError is INFINITY at top level
    if (errorWorldSpace === Infinity || bounds == undefined) {
      return Infinity;
    }

    // const center = projectPoint(mvpMatrix, bounds.center);
    // const d2 = vec3.dot(center, center);
    const d2 = calculateD2(mvpMatrix, bounds.center);
    const r = errorWorldSpace;
    const projectedR = (cotHalfFov * r) / Math.sqrt(d2 - r * r);
    /*console.log({
      cotHalfFov,
      center,
      d2,
      r,
      projectedR,
      result: (projectedR * screenHeight) / 2.0,
      THRESHOLD: CONFIG.nanite.render.pixelThreshold,
    });*/
    return (projectedR * screenHeight) / 2.0;
  };
}

export const calcCotHalfFov = (fovDgr = CAMERA_CFG.fovDgr) => {
  const fovRad = dgr2rad(fovDgr);
  return 1.0 / Math.tan(fovRad / 2.0);
};

function calculateD2(m: Mat4, v: Vec3): number {
  // project point
  const a = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
  const b = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
  const c = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
  // dot product
  return a * a + b * b + c * c;
}
