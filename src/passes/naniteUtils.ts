import { Mat4, vec3 } from 'wgpu-matrix';
import { PassCtx } from './passCtx.ts';
import { BoundingSphere, dgr2rad, projectPoint } from '../utils/index.ts';
import { CAMERA_CFG } from '../constants.ts';
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

export function calcNaniteMeshletsVisibility(
  ctx: PassCtx,
  naniteLOD: NaniteLODTree
) {
  const root = naniteLOD.root;
  const meshletsToCheck = [...root.createdFrom];
  const visitedMeshlets: Set<number> = new Set();
  const renderedMeshlets: NaniteMeshletTreeNode[] = [];

  while (meshletsToCheck.length > 0) {
    const meshlet = meshletsToCheck.shift()!; // remove 1st from queue
    visitedMeshlets.add(meshlet.id);

    const status = getVisibilityStatus(ctx, meshlet);

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

  // root has no .parentError, so we cannot project it
  if (renderedMeshlets.length === 0) {
    renderedMeshlets.push(root);
  }

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
 * TODO use the meshoptimizer's cone setting for culling
 */
function getVisibilityStatus(
  ctx: PassCtx,
  meshlet: NaniteMeshletTreeNode
): NaniteVisibilityStatus {
  // WARNING: .parentError is INFINITY at top level
  if (meshlet.parentBounds == undefined || meshlet.parentError === undefined) {
    return 'check-children';
  }

  const viewH = ctx.viewport.height;
  const mvpMat = ctx.mvpMatrix;
  // prettier-ignore
  const clusterError = getProjectedError(mvpMat, viewH, meshlet.bounds, meshlet.maxSiblingsError);
  // prettier-ignore
  const parentError = getProjectedError(mvpMat, viewH, meshlet.parentBounds, meshlet.parentError);
  const threshold = 1; // in pixels TODO move to config/UI

  const shouldRenderThisExactMeshlet =
    parentError > threshold && clusterError <= threshold;
  return shouldRenderThisExactMeshlet ? 'rendered' : 'check-children';
}

/** Projected error in pixels. https://stackoverflow.com/a/21649403 */
function getProjectedError(
  mvpMatrix: Mat4,
  screenHeight: number,
  bounds: BoundingSphere,
  errorWorldSpace: number
) {
  if (errorWorldSpace === Infinity) return errorWorldSpace;

  const center = projectPoint(mvpMatrix, bounds.center);
  const fovRad = dgr2rad(CAMERA_CFG.fovDgr);
  const cotHalfFov = 1.0 / Math.tan(fovRad / 2.0); // TODO do not recalc every time: createErrorMetric() with closure
  const d2 = vec3.dot(center, center);
  const r = errorWorldSpace;
  const pr = (cotHalfFov * r) / Math.sqrt(d2 - r * r);
  return (pr * screenHeight) / 2.0;
}
