import { VERTS_IN_TRIANGLE } from '../constants.ts';
import { createArray, getTriangleCount } from '../utils/index.ts';

/** Indices of the vertices. First index is the smaller number.
 *
 * Using object that has build-in == operator turns out to be fast.
 * Ideally it would be a number, but 32bits is too small. BigInt is slow.
 * We could try to use collision-prone hash for coarse phase
 * (something like collision detection) with the Map-based algo.
 */
export type Edge = string;

// min, max used for easier isSameEdge()
export const createEdge = (ii: number, jj: number): Edge =>
  `${Math.min(ii, jj)}-${Math.max(ii, jj)}`;

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

export const isSameEdge = (e0: Edge, e1: Edge): boolean => e0 === e1;

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

/** DEPENDS OF ALL MESHLETS SHARING SAME VERTEX BUFFER THAT DOES NOT HAVE DUPLICATES!
 *
 * Quadratic scaling with ln search.
 */
export function findAdjacentMeshlets_Iter(edgesPerMeshlet: Edge[][]) {
  const edgesPerMeshlet2 = edgesPerMeshlet.map((m) => new Set(m));

  const hasSharedEdge = (meshlet0: Set<string>, meshlet1: Set<string>) => {
    for (const e0 of meshlet0) {
      if (meshlet1.has(e0)) return true;
    }
    return false;
  };

  const result: number[][] = createArray(edgesPerMeshlet2.length).map(() => []);
  for (let i = 0; i < edgesPerMeshlet2.length; i++) {
    const meshlet0 = edgesPerMeshlet2[i];
    for (let j = i + 1; j < edgesPerMeshlet2.length; j++) {
      const meshlet1 = edgesPerMeshlet2[j];
      if (i !== j && hasSharedEdge(meshlet0, meshlet1)) {
        result[i].push(j);
        result[j].push(i);
      }
    }
  }
  return result;
}

/** DEPENDS OF ALL MESHLETS SHARING SAME VERTEX BUFFER THAT DOES NOT HAVE DUPLICATES!
 *
 * Uses map to detect shared edges between meshlets.
 */
export function findAdjacentMeshlets_Map(edgesPerMeshlet: Edge[][]) {
  const mmap = new Map<string, Array<number>>();
  for (let i = 0; i < edgesPerMeshlet.length; i++) {
    const meshlet0 = edgesPerMeshlet[i];
    for (let j = 0; j < meshlet0.length; j++) {
      const edgeHash = meshlet0[j];
      const d = mmap.get(edgeHash) || [];
      d.push(i);
      mmap.set(edgeHash, d);
    }
  }
  // console.log(mmap);

  const result: number[][] = createArray(edgesPerMeshlet.length).map(() => []);
  mmap.forEach((meshletIds2) => {
    // console.log(meshletIds);
    const meshletIds = Array.from(meshletIds2);
    const l = meshletIds.length;
    for (let i = 0; i < l; i++) {
      for (let j = i + 1; j < l; j++) {
        const m0 = meshletIds[i];
        const m1 = meshletIds[j];
        // remember, meshlets can share multiple edges
        if (!result[m0].includes(m1)) result[m0].push(m1);
        if (!result[m1].includes(m0)) result[m1].push(m0);
      }
    }
  });
  return result;
}
