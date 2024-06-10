import { BYTES_U32, STATS } from '../constants.ts';
import { MeshletId, NaniteLODTree } from '../scene/naniteLODTree.ts';
import {
  BoundingSphere,
  calcBoundingSphere,
  formatBytes,
  pluckVertices,
} from '../utils/index.ts';
import { createMeshlets, splitIndicesPerMeshlets } from './createMeshlets.ts';
import {
  listAllEdges,
  findBoundaryEdges,
  Edge,
  findAdjacentMeshlets,
} from './edgesUtils.ts';
import { partitionGraph } from './partitionGraph.ts';
import { simplifyMesh } from './simplifyMesh.ts';

/** We half triangle count each time. Each meshlet is 124 triangles.
 * $2^{MAX_LODS}*124$. E.g. MAX_LODS=15 gives 4M. Vertices above would
 * lead to many top-level tree nodes. Suboptimal, but not incorrect.
 */
const MAX_LODS = 15;

/** Reduce triangle count per each level. */
const DECIMATE_FACTOR = 2;
const TARGET_SIMPLIFY_ERROR = 0.05;

let NEXT_MESHLET_ID = 0;

/** Meshlet when constructing the tree */
export interface MeshletWIP {
  id: MeshletId;
  /** In tree, these are the children nodes */
  createdFrom: MeshletWIP[];
  lodLevel: number;
  indices: Uint32Array;
  boundaryEdges: Edge[];

  // Error calc:
  /** Error for this node */
  maxSiblingsError: number;
  /** Infinity for top tree level */
  parentError: number;
  bounds: BoundingSphere;
  parentBounds: BoundingSphere | undefined; // undefined at top level
}

export async function createNaniteMeshlets(
  vertices: Float32Array,
  indices: Uint32Array
): Promise<MeshletWIP[]> {
  const allMeshlets: MeshletWIP[] = [];
  let lodLevel = 0;
  const bottomMeshlets = await splitIntoMeshlets(
    indices,
    0.0,
    calculateBounds(indices)
  );
  let currentMeshlets = bottomMeshlets;
  lodLevel += 1;

  for (; lodLevel < MAX_LODS + 1; lodLevel++) {
    // prettier-ignore
    // console.log(`LOD ${lodLevel}: Starting with ${currentMeshlets.length} meshlets`);

    // 1. group meshlets into groups of 4
    // e.g. 33 meshlets is 9 groups (last one is 1 meshlet)
    const GROUP_SIZE = 4;
    const nparts = Math.ceil(currentMeshlets.length / GROUP_SIZE);
    let partitioned = [currentMeshlets];
    if (currentMeshlets.length > GROUP_SIZE) {
      const adjacency = findAdjacentMeshlets(
        currentMeshlets.map((m) => m.boundaryEdges)
      );
      // each part is 4 meshlets
      const meshletIdxPerPart = await partitionGraph(adjacency, nparts, {});
      partitioned = meshletIdxPerPart.map((indices) => {
        return indices.map((i) => currentMeshlets[i]);
      });
    }

    // 2. for each group of 4 meshlets
    const newlyCreatedMeshlets: MeshletWIP[] = [];
    for (const childMeshletGroup of partitioned) {
      // 2.1 [GROUP] merge triangles from all meshlets in the group
      const megaMeshlet: Uint32Array = mergeMeshlets(...childMeshletGroup);

      // 2.2 [GROUP] simplify to remove not needed edges/vertices in the middle
      const targetIndexCount = Math.floor(megaMeshlet.length / DECIMATE_FACTOR);
      const simplifiedMesh = await simplifyMesh(vertices, megaMeshlet, {
        targetIndexCount,
        targetError: TARGET_SIMPLIFY_ERROR,
        lockBorders: true, // important!
      });
      const errorNow = simplifiedMesh.error * simplifiedMesh.errorScale;
      const childrenError = Math.max(
        ...childMeshletGroup.map((m) => m.maxSiblingsError)
      );
      const totalError = errorNow + childrenError;
      const bounds = calculateBounds(simplifiedMesh.indexBuffer);

      // 2.3 [GROUP] split into new meshlets. Share: simplificationError, bounds
      let newMeshlets: MeshletWIP[];
      if (partitioned.length === 1) {
        // this happens on last iteration, when < 4 meshlets
        // prettier-ignore
        const rootMeshlet = createMeshletWip(simplifiedMesh.indexBuffer, totalError, bounds);
        newMeshlets = [rootMeshlet];
      } else {
        // prettier-ignore
        newMeshlets = await splitIntoMeshlets(simplifiedMesh.indexBuffer, totalError, bounds);
      }

      childMeshletGroup.forEach((childMeshlet) => {
        childMeshlet.parentError = totalError; // set based on simplify, not meshlets!
        // childMeshlet.maxSiblingsError = childrenError; // NO!
        childMeshlet.parentBounds = bounds;

        newMeshlets.forEach((m2) => {
          m2.createdFrom.push(childMeshlet);
        });
      });
      newlyCreatedMeshlets.push(...newMeshlets);
    }

    currentMeshlets = newlyCreatedMeshlets;
    if (currentMeshlets.length < 2) {
      console.log(`Did not fill all ${MAX_LODS} LOD levels, mesh is too small`);
      break;
    }
  }

  console.log('[Nanite] All meshlets:', allMeshlets);
  console.log('[Nanite] Top level meshlets:', currentMeshlets);
  console.log(
    `[Nanite] Created LOD levels: ${lodLevel} (total ${allMeshlets.length} meshlets from ${bottomMeshlets.length} bottom level meshlets)`
  );

  if (currentMeshlets.length !== 1) {
    // It's ok to increase $MAX_LODS, just make sure you know what you are doing.
    throw new Error(
      `Nanite created ${lodLevel} LOD levels and would still require more? How big is your mesh?! Increase MAX_LODS (currrently ${MAX_LODS}) or reconsider mesh.`
    );
  }

  return allMeshlets;

  /////////////
  /// Utils

  async function splitIntoMeshlets(
    indices: Uint32Array,
    simplificationError: number,
    bounds: BoundingSphere
  ) {
    const meshletsOpt = await createMeshlets(vertices, indices, {});
    // during init: create tons of small meshlets
    // during iter: split simplified mesh into 2 meshlets
    const meshletsIndices = splitIndicesPerMeshlets(meshletsOpt);

    const meshlets: MeshletWIP[] = meshletsIndices.map((indices) =>
      createMeshletWip(indices, simplificationError, bounds)
    );

    return meshlets;
  }

  function createMeshletWip(
    indices: Uint32Array,
    simplificationError: number,
    bounds: BoundingSphere
  ): MeshletWIP {
    const edges = listAllEdges(indices);
    const boundaryEdges = findBoundaryEdges(edges);
    const m: MeshletWIP = {
      id: NEXT_MESHLET_ID,
      indices,
      boundaryEdges,
      // maxSiblingsError will temporarly hold the error till
      // we determine siblings in next iter
      maxSiblingsError: simplificationError,
      parentError: Infinity,
      bounds,
      parentBounds: undefined,
      lodLevel,
      createdFrom: [],
    };
    NEXT_MESHLET_ID += 1;
    allMeshlets.push(m);
    return m;
  }

  function calculateBounds(indices: Uint32Array) {
    return calcBoundingSphere(pluckVertices(vertices, indices));
  }
}

function mergeMeshlets(...meshletGroup: MeshletWIP[]): Uint32Array {
  const len = meshletGroup.reduce((acc, m) => acc + m.indices.length, 0);
  const result = new Uint32Array(len);

  // copy all indices into a single Uint32Array one by one
  let nextIdx = 0;
  meshletGroup.forEach((m) => {
    m.indices.forEach((idx) => {
      result[nextIdx] = idx;
      nextIdx += 1;
    });
  });

  return result;
}

export function createNaniteLODTree(
  device: GPUDevice,
  vertexBuffer: GPUBuffer,
  allMeshlets: MeshletWIP[]
): NaniteLODTree {
  // TODO use SINGLE Index buffer (offsets+sizes per meshlet).
  const lodLevels = 1 + Math.max(...allMeshlets.map((m) => m.lodLevel)); // includes LOD level 0
  const roots = allMeshlets.filter((m) => m.lodLevel === lodLevels - 1);
  if (roots.length !== 1) {
    // prettier-ignore
    throw new Error(`Expected 1 Nanite LOD tree root, found ${roots.length}. Searched for LOD level ${lodLevels - 1}`);
  }

  const naniteLODTree = new NaniteLODTree(vertexBuffer);

  const meshletsToCheck: MeshletWIP[] = [roots[0]];
  while (meshletsToCheck.length > 0) {
    const meshlet = meshletsToCheck.shift()!; // remove 1st from queue
    naniteLODTree.addMeshlet(device, meshlet);
    meshlet.createdFrom.forEach((m) => {
      if (m) {
        meshletsToCheck.push(m);
      }
    });
  }

  // fill `createdFrom`
  allMeshlets.forEach((m) => {
    const node = naniteLODTree.find(m.id)!;
    m.createdFrom.forEach((mChild) => {
      const chNode = naniteLODTree.find(mChild.id);
      if (chNode !== undefined && node !== undefined) {
        node.createdFrom.push(chNode);
      } else {
        const missing = chNode === undefined ? mChild.id : m.id;
        // prettier-ignore
        throw new Error(`Error finalizing nanite LOD tree. Could not find meshlet ${missing}`);
      }
    });
  });

  if (allMeshlets.length !== naniteLODTree.allMeshlets.length) {
    // prettier-ignore
    throw new Error(`Created ${allMeshlets.length} meshlets, but only ${naniteLODTree.allMeshlets.length} were added to the LOD tree?`);
  }

  STATS['Vertex buffer:'] = formatBytes(vertexBuffer.size);
  STATS['Index buffer:'] = formatBytes(
    BYTES_U32 * naniteLODTree.totalIndicesCount
  );
  return naniteLODTree;
}
