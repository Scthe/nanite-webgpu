import { VERTS_IN_TRIANGLE } from '../constants.ts';
import { getTriangleCount } from '../utils/index.ts';

// TODO This should find vertices that have same *positions*, not indices.
//      I.e. vertices with same position and different normals
//      count as 2 vertices, but we should count them
//      as the same vertex.
//      ATM we also depend on using single vertex buffer BTW.
//      TBH Only change needed: isSameEdge() should compare vertex positions.

/** Indices of the vertices. First index is the smaller number. */
export type Edge = [number, number];

// min, max used for easier isSameEdge()
export const createEdge = (ii: number, jj: number): Edge => [
  Math.min(ii, jj),
  Math.max(ii, jj),
];

export function listAllEdges(indices: Uint32Array): Edge[] {
  if (indices.length % VERTS_IN_TRIANGLE !== 0) {
    throw new Error(
      `Index buffer has ${indices.length} indices, cannot make triangles from this`
    );
  }

  const result: Edge[] = [];
  const triangleCount = getTriangleCount(indices);
  const addEdge = (ii: number, jj: number) => result.push(createEdge(ii, jj)); // min, max used for easier isSameEdge()

  for (let i = 0; i < triangleCount; i++) {
    const i0 = indices[VERTS_IN_TRIANGLE * i];
    const i1 = indices[VERTS_IN_TRIANGLE * i + 1];
    const i2 = indices[VERTS_IN_TRIANGLE * i + 2];
    addEdge(i0, i1);
    addEdge(i0, i2);
    addEdge(i1, i2);
  }

  return result;
}

export const isSameEdge = (e0: Edge, e1: Edge): boolean =>
  e0[0] === e1[0] && e0[1] === e1[1];

/** Boundary edges - edge that belongs to only 1 triangle. */
export function findBoundaryEdges(allEdges: Edge[]): Edge[] {
  const countEdgeRepeats = (e: Edge) => {
    let repeats = 0;
    allEdges.forEach((e2) => {
      if (isSameEdge(e, e2)) repeats += 1;
    });
    return repeats;
  };

  // only in 1 triangle, so not shared by 2 triangles
  return allEdges.filter((e) => countEdgeRepeats(e) == 1);
}

/** TODO DEPENDS OF ALL MESHLETS SHARING SAME VERTEX BUFFER THAT DOES NOT HAVE DUPLICATES! */
export function findAdjacentMeshlets(edgesPerMeshlet: Edge[][]) {
  const hasSharedEdge = (meshlet0: Edge[], meshlet1: Edge[]) => {
    for (const e0 of meshlet0) {
      for (const e1 of meshlet1) {
        if (isSameEdge(e0, e1)) return true;
      }
    }
    return false;
  };

  return edgesPerMeshlet.map((meshlet0, i) => {
    const result: number[] = [];
    edgesPerMeshlet.forEach((meshlet1, j) => {
      if (i !== j && hasSharedEdge(meshlet0, meshlet1)) {
        result.push(j);
      }
    });
    return result;
  });
}
