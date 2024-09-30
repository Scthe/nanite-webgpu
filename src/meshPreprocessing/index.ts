import { CONFIG, VERTS_IN_TRIANGLE } from '../constants.ts';
import { MeshletId } from '../scene/naniteObject.ts';
import {
  clamp,
  formatPercentageNumber,
  getTriangleCount,
} from '../utils/index.ts';
import { BoundingSphere, calculateBounds } from '../utils/calcBounds.ts';
import { createMeshlets, splitIndicesPerMeshlets } from './createMeshlets.ts';
import {
  listAllEdges,
  findBoundaryEdges,
  Edge,
  findAdjacentMeshlets_Iter,
  findAdjacentMeshlets_Map,
} from './edgesUtils.ts';
import { metisFreeAllocations, partitionGraph } from './partitionGraph.ts';
import { calculateTargetIndexCount, simplifyMesh } from './simplifyMesh.ts';
import { ParsedMesh } from '../scene/objLoader.ts';

/*

See following discussions:

- https://github.com/bevyengine/bevy/discussions/14998
- https://github.com/zeux/meshoptimizer/discussions/750

And then read README.md for https://github.com/Scthe/nanite-simplification-tests.
Especially updated version of this file in:

- https://github.com/Scthe/nanite-simplification-tests/blob/master/src/meshPreprocessing/index.ts

*/

const findAdjacentMeshlets = CONFIG.nanite.preprocess.useMapToFindAdjacentEdges
  ? findAdjacentMeshlets_Map
  : findAdjacentMeshlets_Iter;

const DEBUG = false;

/** Progress [0..1]. Promise, so you can yield thread (for DOM updates) if you want */
export type MeshPreprocessProgressCb = (progress: number) => Promise<void>;

/** Sometimes you get simplification error 0 and then error for children and parent are same. Would render both at same time. */
const MINIMAL_SIMPLICATION_ERROR = 0.000000001;

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

  // Nanite error calc:
  /** ## CALCULATED DURING CREATION!
   * Simplification error when the meshlet was created. Shared between all the meshlets created from the same lower level (more detailed) meshlets */
  maxSiblingsError: number;
  /** ## CALCULATED DURING CREATION!
   *  Combined bounds of the (lower level, more detailed) meshlets used to create this meshlet. Shared with other meshlets created from the same meshlets */
  sharedSiblingsBounds: BoundingSphere;
  /** ## ASSINGED WHEN MORE COARSE MESHLET USES US AS A BASE!
   * Parent/higher-level meshlets means created from this meshlet. `Infinity` for root (most coarse) meshlet. */
  parentError: number;
  /** ## ASSINGED WHEN MORE COARSE MESHLET USES US AS A BASE!
   * Parent/higher-level meshlets means created from this meshlet. `undefined` for root (most coarse) meshlet. */
  parentBounds: BoundingSphere | undefined;
}

export const isWIP_Root = (m: Pick<MeshletWIP, 'parentBounds'>) =>
  m.parentBounds === undefined;

export async function createNaniteMeshlets(
  parsedMesh: ParsedMesh,
  indices: Uint32Array,
  progressCb?: MeshPreprocessProgressCb
): Promise<MeshletWIP[]> {
  const np = CONFIG.nanite.preprocess;
  const DECIMATE_FACTOR = np.simplificationDecimateFactor;
  const SIMPLIFICATION_FACTOR_REQ = np.simplificationFactorRequirement;
  const SIMPLIFICATION_FACTOR_REQ_BETWEEN_LEVELS =
    1.0 - np.simplificationFactorRequirementBetweenLevels;
  const SIMPLIFICATION_TARGET_ERROR_MULTIPLIER =
    np.simplificationTargetErrorMultiplier;
  const MAX_LODS = np.maxLods;

  NEXT_MESHLET_ID = 0;
  const estimatedMeshletCount = estimateFinalMeshletCount(indices); // guess for progress stats

  const allMeshlets: MeshletWIP[] = [];
  let lodLevel = 0;
  // does not matter, bottom meshlets have error 0, so they always pass
  // the 'has error < threshold' check. They only depend on the parent's error.
  // If the parent also passes the check, the parent should be rendered instead
  const mockBounds = calculateBounds(parsedMesh.positions, indices).sphere;
  const bottomMeshlets = await splitIntoMeshlets(indices, 0.0, [], mockBounds);

  let currentMeshlets = bottomMeshlets;
  lodLevel += 1;
  let simplificationTargetError =
    CONFIG.nanite.preprocess.simplificationTargetError;
  let lastLevelTriangeCount = -1;

  for (; lodLevel < MAX_LODS + 1; lodLevel++) {
    // break condition: nothing left to minimize
    // prettier-ignore
    if (currentMeshlets.length <= 1) {
      // console.log(`Did not fill all ${MAX_LODS} LOD levels, mesh is too small`);
      break;
    }

    // break condition: no change in triangle count between 2 last LOD levels
    const startTriangeCount = getMeshletsTriangleCount(currentMeshlets);
    if (startTriangeCount === lastLevelTriangeCount) {
      console.warn(`LOD iteration failed to simplify even a single triangle at level ${lodLevel}. Stopping at ${currentMeshlets.length} meshlets.`); // prettier-ignore
      break;
    }

    // break condition: we started removing too few triangles for us to bother continuing
    const removedTrisStr = lodLevel == 1 ? '' : `Previous level removed ${formatPercentageNumber(lastLevelTriangeCount - startTriangeCount, lastLevelTriangeCount)} of the remaining triangles.`; // prettier-ignore
    const simplificationBetweenLevels = 1.0 - (startTriangeCount / lastLevelTriangeCount); // prettier-ignore
    const removedEnough =
      simplificationBetweenLevels >= SIMPLIFICATION_FACTOR_REQ_BETWEEN_LEVELS;
    if (lodLevel > 1 && !removedEnough) {
      console.warn(`LOD iteration became too ineffective at level ${lodLevel}. ${removedTrisStr} Stopping at ${currentMeshlets.length} meshlets.`); // prettier-ignore
      break;
    }

    // log
    console.log(`Creating LOD level ${lodLevel}. Starting with ${startTriangeCount} triangles (${currentMeshlets.length} meshlets). ${removedTrisStr}`); // prettier-ignore
    lastLevelTriangeCount = startTriangeCount;

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
    if (DEBUG) {
      // prettier-ignore
      console.log(
        `[LOD ${lodLevel}] Starting with ${currentMeshlets.length} meshlets.`,
        `Partition into groups of <=4 meshlets:`, partitioned
      );
    }

    // 2. for each group of 4 meshlets
    const newlyCreatedMeshlets: MeshletWIP[] = [];
    for (const childMeshletGroup of partitioned) {
      // 2.1 [GROUP] merge triangles from all meshlets in the group
      const megaMeshlet: Uint32Array = mergeMeshlets(...childMeshletGroup);

      // 2.2 [GROUP] simplify to remove not needed edges/vertices in the middle
      const targetIndexCount = calculateTargetIndexCount(
        megaMeshlet.length,
        DECIMATE_FACTOR
      );
      const simplifiedMesh = await simplifyMesh(parsedMesh, megaMeshlet, {
        targetIndexCount,
        targetError: simplificationTargetError,
        lockBorders: true, // important!
      });

      // AKA percent of triangles still left after simplify.
      // Check if we simplified enough. If we could not simplify further, no point
      // in continuing for this group for higher levels
      const trianglesBefore = getTriangleCount(megaMeshlet);
      const trianglesAfter = getTriangleCount(simplifiedMesh.indexBuffer);
      const simplificationFactor = trianglesAfter / trianglesBefore;
      if (simplificationFactor > SIMPLIFICATION_FACTOR_REQ) {
        // Simplification unsuccessful. This is OK for complicated objects
        // Current `childMeshlet` will be roots of the LOD tree (no parent).
        console.warn(`Part of the mesh could not be simplified more (LOD level=${lodLevel}). Reduced from ${trianglesBefore} to ${formatPercentageNumber(trianglesAfter, trianglesBefore)} triangles`); // prettier-ignore
        continue;
      }

      // simplification went OK, calculate meshlet data
      const errorNow = Math.max(
        simplifiedMesh.error * simplifiedMesh.errorScale,
        MINIMAL_SIMPLICATION_ERROR
      );
      const childrenError = Math.max(
        ...childMeshletGroup.map((m) => m.maxSiblingsError)
      );
      const totalError = errorNow + childrenError;
      const bounds = calculateBounds(parsedMesh.positions, megaMeshlet).sphere;

      // 2.3 [GROUP] split into new meshlets. Share: simplificationError, bounds (both are used in nanite to reproject the error)
      let newMeshlets: MeshletWIP[];
      if (partitioned.length === 1) {
        // this happens on last iteration, when < 4 meshlets
        // prettier-ignore
        const rootMeshlet = await createMeshletWip(simplifiedMesh.indexBuffer, totalError, childMeshletGroup, bounds);
        newMeshlets = [rootMeshlet];
      } else {
        // prettier-ignore
        newMeshlets = await splitIntoMeshlets(simplifiedMesh.indexBuffer, totalError, childMeshletGroup, bounds);
      }

      if (DEBUG) {
        // prettier-ignore
        console.log(
          `\tTry simplify (intial=${getTriangleCount(megaMeshlet)} into target=${getTriangleCount(targetIndexCount)} tris), got ${getTriangleCount(simplifiedMesh.indexBuffer)} tris (${(100.0 * simplificationFactor).toFixed(2)}%).`,
          'Meshlets:', newMeshlets
        );
      }

      // update all lower level meshlets with parent data.
      // This way they all take same decision when deciding if render self or parent
      childMeshletGroup.forEach((childMeshlet) => {
        childMeshlet.parentError = totalError; // set based on simplify, not meshlets!
        childMeshlet.parentBounds = bounds;
        // childMeshlet.maxSiblingsError = childrenError; // NO! DO NOT EVER TOUCH THIS
      });
      newlyCreatedMeshlets.push(...newMeshlets);
    }

    // check if the base mesh (LOD level 0) is even simplify-able into LOD level 1
    if (lodLevel == 1 && newlyCreatedMeshlets.length == 0) {
      throw new SimplificationError(lodLevel - 1, parsedMesh.vertexCount);
    }

    currentMeshlets = newlyCreatedMeshlets;
    simplificationTargetError *= SIMPLIFICATION_TARGET_ERROR_MULTIPLIER;
  }

  // We have filled all LOD tree levels (or reached MAX_LODS iters).
  // By now the LOD tree is complete

  // mass free the memory, see the JSDocs of the fn.
  metisFreeAllocations();

  return allMeshlets;

  /////////////
  /// Utils

  async function splitIntoMeshlets(
    indices: Uint32Array,
    simplificationError: number,
    createdFrom: MeshletWIP[],
    sharedSiblingsBounds: BoundingSphere
  ) {
    const meshletsOpt = await createMeshlets(parsedMesh, indices, {
      maxVertices: CONFIG.nanite.preprocess.meshletMaxVertices,
      maxTriangles: CONFIG.nanite.preprocess.meshletMaxTriangles,
      coneWeight: CONFIG.nanite.preprocess.meshletBackfaceCullingConeWeight,
    });
    // during init: create tons of small meshlets
    // during iter: split simplified mesh into 2+ meshlets
    const meshletsIndices = splitIndicesPerMeshlets(meshletsOpt);

    const meshlets: MeshletWIP[] = await Promise.all(
      meshletsIndices.map((indices) => {
        return createMeshletWip(
          indices,
          simplificationError,
          createdFrom,
          sharedSiblingsBounds
        );
      })
    );

    return meshlets;
  }

  async function createMeshletWip(
    indices: Uint32Array,
    simplificationError: number,
    createdFrom: MeshletWIP[],
    sharedSiblingsBounds: BoundingSphere
  ): Promise<MeshletWIP> {
    const edges = listAllEdges(indices);
    const boundaryEdges = findBoundaryEdges(edges);
    const m: MeshletWIP = {
      id: NEXT_MESHLET_ID,
      indices,
      boundaryEdges,
      maxSiblingsError: simplificationError,
      parentError: Infinity,
      sharedSiblingsBounds,
      parentBounds: undefined,
      lodLevel,
      createdFrom,
    };
    NEXT_MESHLET_ID += 1;
    allMeshlets.push(m);
    await reportProgress();
    return m;
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

export class SimplificationError extends Error {
  constructor(lodLevel: number, vertexCount: number) {
    // Flat shading turns each triangle into something like it's own sub-mesh.
    // All 3 triangle vertices share same normal, but a triangle
    // next to it has different normal, so 3 more vertices.
    // In that case, 2 triangles next to each other have 6 different unique
    // vertices instead of 4. This is impossible to simplify.
    // This could be enforced in code, but I'm too lazy.

    // prettier-ignore
    super(
      `Failed to simplify the mesh. Was not able to simplify beyond LOD level ${lodLevel}. This usually happens if you have duplicated vertices (${vertexCount}, should roughly match Blender's). One cause could be a flat shading or tons of UV islands.`
    );
  }
}

function getMeshletsTriangleCount(mx: MeshletWIP[]) {
  const idxCnt = mx.reduce((acc, m) => acc + m.indices.length, 0);
  return getTriangleCount(idxCnt);
}
