import { vec3, Mat4 } from 'wgpu-matrix';
import { PassCtx } from './passCtx.ts';
import {
  BoundingSphere,
  dgr2rad,
  getModelViewProjectionMatrix,
  projectPoint,
} from '../utils/index.ts';
import { CAMERA_CFG, CONFIG } from '../constants.ts';
import {
  NaniteLODTree,
  NaniteMeshletTreeNode,
} from '../scene/naniteLODTree.ts';

/**
 * 'hidden' - skip subtree
 * 'rendered' - this is the correct level to render
 * 'check-children' - children have more appropriate LOD
 */
type NaniteVisibilityStatus = 'hidden' | 'rendered' | 'check-children';

// TODO rename: calcNaniteMeshletsVisibility / naniteVisibility or smth.

export function calcNaniteMeshletsVisibility(
  ctx: PassCtx,
  modelMat: Mat4,
  naniteLOD: NaniteLODTree
) {
  const root = naniteLOD.root;
  const meshletsToCheck = [root];
  const visitedMeshlets: Set<number> = new Set();
  const renderedMeshlets: NaniteMeshletTreeNode[] = [];
  const getProjectedError = createErrorMetric(ctx, modelMat);

  while (meshletsToCheck.length > 0) {
    const meshlet = meshletsToCheck.shift()!; // remove 1st from queue
    visitedMeshlets.add(meshlet.id);

    const status = getVisibilityStatus(getProjectedError, meshlet);

    if (status === 'rendered') {
      // skip children - we are at the correct cut-off level
      renderedMeshlets.push(meshlet);
    } else if (status === 'check-children') {
      // check lower levels of LOD tree
      meshlet.createdFrom.forEach((m) => {
        if (m && !visitedMeshlets.has(m.id)) {
          visitedMeshlets.add(m.id);
          meshletsToCheck.push(m);
        }
      });
    }
  }

  // console.log({ visitedMeshlets }); // debug how far the tree we went
  return renderedMeshlets;
}

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
 *
 * TODO use the meshoptimizer's cone setting for culling. Remember about transform matrices
 */
export function getVisibilityStatus(
  getProjectedError: ReturnType<typeof createErrorMetric>,
  meshlet: NaniteMeshletTreeNode
): NaniteVisibilityStatus {
  // prettier-ignore
  const clusterError = getProjectedError(meshlet.bounds, meshlet.maxSiblingsError);
  // prettier-ignore
  const parentError = getProjectedError(meshlet.parentBounds, meshlet.parentError);

  const threshold = CONFIG.nanite.render.pixelThreshold; // in pixels
  const shouldRenderThisExactMeshlet =
    parentError > threshold && clusterError <= threshold;

  // const dbgVsThr = (a: number) => (a > threshold ? 'GREATER' : 'LESSER(OK)');
  // console.log("CMP: ", {id:meshlet.id, parent: dbgVsThr(parentError), cluster: dbgVsThr(clusterError), }); // prettier-ignore
  return shouldRenderThisExactMeshlet ? 'rendered' : 'check-children';
}

/** Projected error in pixels. https://stackoverflow.com/a/21649403 */
export function createErrorMetric(ctx: PassCtx, modelMat: Mat4) {
  const mvpMatrix = getModelViewProjectionMatrix(
    modelMat,
    ctx.viewMatrix,
    ctx.projMatrix
  );
  const screenHeight = ctx.viewport.height;
  const cotHalfFov = calcCotHalfFov(); // ~2.414213562373095,

  return (bounds: BoundingSphere | undefined, errorWorldSpace: number) => {
    // WARNING: .parentError is INFINITY at top level
    if (errorWorldSpace === Infinity || bounds == undefined) {
      return Infinity;
    }

    const center = projectPoint(mvpMatrix, bounds.center);
    const d2 = vec3.dot(center, center);
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
