import { CONFIG, VERTS_IN_TRIANGLE } from '../constants.ts';
import { MeshletId } from '../scene/naniteObject.ts';
import {
  BoundingSphere,
  calcBoundingSphere,
  clamp,
  pluckVertices,
} from '../utils/index.ts';
import {
  createMeshlets,
  meshopt_Bounds,
  splitIndicesPerMeshlets,
} from './createMeshlets.ts';
import {
  listAllEdges,
  findBoundaryEdges,
  Edge,
  findAdjacentMeshlets_Iter,
  findAdjacentMeshlets_Map,
} from './edgesUtils.ts';
import { metisFreeAllocations, partitionGraph } from './partitionGraph.ts';
import { simplifyMesh } from './simplifyMesh.ts';

const findAdjacentMeshlets = CONFIG.nanite.preprocess.useMapToFindAdjacentEdges
  ? findAdjacentMeshlets_Map
  : findAdjacentMeshlets_Iter;

/** We half triangle count each time. Each meshlet is 124 triangles.
 * $2^{MAX_LODS}*124$. E.g. MAX_LODS=15 gives 4M. Vertices above would
 * lead to many top-level tree nodes. Suboptimal, but not incorrect.
 */
const MAX_LODS = 20;

/** Reduce triangle count per each level. */
const DECIMATE_FACTOR = 2;
const TARGET_SIMPLIFY_ERROR = 0.05;

/** Progress [0..1]. Promise, so you can yield thread (for DOM updates) if you want */
export type MeshPreprocessProgressCb = (progress: number) => Promise<void>;

let NEXT_MESHLET_ID = 0;

/**
 * Meshlet when constructing the tree. This is an intermediary structure.
 * Later on we will convert it to 'NaniteMeshletTreeNode'.
 *
 * WIP - work in progress
 */
export interface MeshletWIP {
  id: MeshletId;
  /** In tree, these are the children nodes */
  createdFrom: MeshletWIP[];
  /** 0 for leaf, N for root (e.g. 6 is the root for bunny.obj) */
  lodLevel: number;
  indices: Uint32Array;
  boundaryEdges: Edge[];
  // TODO it should be used for culling instead of current $sharedSiblingsBounds?
  ownBounds: meshopt_Bounds | undefined;

  // Nanite error calc:
  /** Error for this node */
  maxSiblingsError: number;
  /** Infinity for top tree level */
  parentError: number;
  /** Bounds (shared by all sibling meshlets). */
  sharedSiblingsBounds: BoundingSphere;
  parentBounds: BoundingSphere | undefined; // undefined at top level
}

export async function createNaniteMeshlets(
  vertices: Float32Array,
  indices: Uint32Array,
  progressCb?: MeshPreprocessProgressCb
): Promise<MeshletWIP[]> {
  NEXT_MESHLET_ID = 0;
  const estimatedMeshletCount = estimateFinalMeshletCount(indices); // guess for progress stats

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

      // 2.3 [GROUP] split into new meshlets. Share: simplificationError, bounds (both are used in nanite to reproject the error)
      let newMeshlets: MeshletWIP[];
      if (partitioned.length === 1) {
        // this happens on last iteration, when < 4 meshlets
        // prettier-ignore
        const rootMeshlet = await createMeshletWip(simplifiedMesh.indexBuffer, totalError, bounds, undefined);
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
      // console.log(`Did not fill all ${MAX_LODS} LOD levels, mesh is too small`);
      break;
    }
  }

  if (currentMeshlets.length !== 1) {
    // It's ok to increase $MAX_LODS, just make sure you know what you are doing.
    throw new Error(
      `Nanite created ${lodLevel} LOD levels and would still require more? How big is your mesh?! Increase MAX_LODS (currrently ${MAX_LODS}) or reconsider mesh.`
    );
  }

  // mass free the memory, see the JSDocs of the fn.
  metisFreeAllocations();

  return allMeshlets;

  /////////////
  /// Utils

  async function splitIntoMeshlets(
    indices: Uint32Array,
    simplificationError: number,
    sharedSiblingsBounds: BoundingSphere
  ) {
    const meshletsOpt = await createMeshlets(vertices, indices, {
      maxVertices: CONFIG.nanite.preprocess.meshletMaxVertices,
      maxTriangles: CONFIG.nanite.preprocess.meshletMaxTriangles,
      coneWeight: CONFIG.nanite.preprocess.meshletBackfaceCullingConeWeight,
    });
    // during init: create tons of small meshlets
    // during iter: split simplified mesh into 2+ meshlets
    const meshletsIndices = splitIndicesPerMeshlets(meshletsOpt);

    const meshlets: MeshletWIP[] = await Promise.all(
      meshletsIndices.map((indices, i) => {
        const ownBounds = meshletsOpt.meshlets[i].bounds;
        return createMeshletWip(
          indices,
          simplificationError,
          sharedSiblingsBounds,
          ownBounds
        );
      })
    );

    return meshlets;
  }

  async function createMeshletWip(
    indices: Uint32Array,
    simplificationError: number,
    sharedSiblingsBounds: BoundingSphere,
    ownBounds: meshopt_Bounds | undefined
  ): Promise<MeshletWIP> {
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
      sharedSiblingsBounds,
      parentBounds: undefined,
      lodLevel,
      createdFrom: [],
      ownBounds,
    };
    NEXT_MESHLET_ID += 1;
    allMeshlets.push(m);
    await reportProgress();
    return m;
  }

  function calculateBounds(indices: Uint32Array) {
    return calcBoundingSphere(pluckVertices(vertices, indices));
  }

  async function reportProgress() {
    const progress = clamp(allMeshlets.length / estimatedMeshletCount, 0, 1);
    // console.log({ now: allMeshlets.length, estimatedMeshletCount, progress });
    await progressCb?.(progress);
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

/**
 * Guesses how many meshlets from indices. Not exact,
 * but seems ~OK from the experiments/
 */
function estimateFinalMeshletCount(indices: Uint32Array) {
  const EXTRA_BOTTOM_LEVEL_MESHLETS = 1.5;
  const AVG_MESHLET_REDUCTION_PER_LEVEL = 0.66;

  const triCnt = indices.length / VERTS_IN_TRIANGLE;
  let lastLevelMeshlets =
    Math.ceil(triCnt / CONFIG.nanite.preprocess.meshletMaxTriangles) *
    EXTRA_BOTTOM_LEVEL_MESHLETS;
  let totalMeshlets = lastLevelMeshlets;

  while (lastLevelMeshlets > 1) {
    const nextLevelMeshlets = Math.floor(
      lastLevelMeshlets * AVG_MESHLET_REDUCTION_PER_LEVEL
    );
    totalMeshlets += nextLevelMeshlets;
    lastLevelMeshlets = nextLevelMeshlets;
  }

  return totalMeshlets;
}
