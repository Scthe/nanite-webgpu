import { mat4 } from 'wgpu-matrix';
import {
  BYTES_MAT4,
  BYTES_U32,
  BYTES_UVEC2,
  CONFIG,
  InstancesGrid,
  STATS,
  getInstancesCount,
} from '../constants.ts';
import {
  GPU_MESHLET_SIZE_BYTES,
  MeshletId,
  NaniteInstancesData,
  NaniteLODTree,
} from '../scene/naniteLODTree.ts';
import {
  BoundingSphere,
  calcBoundingSphere,
  createArray,
  formatBytes,
  getBytesForTriangles,
  getTriangleCount,
  pluckVertices,
} from '../utils/index.ts';
import { createGPUBuffer, writeMatrixToGPUBuffer } from '../utils/webgpu.ts';
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
  /** 0 for leaf, N for root (e.g. 6 is the root for bunny.obj) */
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
  NEXT_MESHLET_ID = 0;

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
    const meshletsOpt = await createMeshlets(vertices, indices, {
      maxVertices: CONFIG.nanite.preprocess.meshletMaxVertices,
      maxTriangles: CONFIG.nanite.preprocess.meshletMaxTriangles,
    });
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

// TODO move to scene/createNaniteLODTree.ts
export function createNaniteLODTree(
  device: GPUDevice,
  vertexBuffer: GPUBuffer,
  rawVertices: Float32Array,
  allWIPMeshlets: MeshletWIP[],
  instancesGrid: InstancesGrid
): NaniteLODTree {
  const lodLevels = 1 + Math.max(...allWIPMeshlets.map((m) => m.lodLevel)); // includes LOD level 0 TODO slow
  const roots = allWIPMeshlets.filter((m) => m.lodLevel === lodLevels - 1);
  if (roots.length !== 1) {
    // prettier-ignore
    throw new Error(`Expected 1 Nanite LOD tree root, found ${roots.length}. Searched for LOD level ${lodLevels - 1}`);
  }

  // allocate single shared index buffer. Meshlets will use slices of it
  const totalTriangleCount = getMeshletTriangleCount(allWIPMeshlets);
  const indexBuffer = device.createBuffer({
    label: 'nanite-index-buffer',
    size: getBytesForTriangles(totalTriangleCount),
    usage:
      GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
  const verticesAsVec4 = createVertexBufferForStorageAsVec4(rawVertices);
  const vertexBufferForStorageAsVec4 = createGPUBuffer(
    device,
    'nanite-vertex-buffer-vec4',
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    verticesAsVec4
  );

  const meshletsBuffer = createMeshletsDataBuffer(device, allWIPMeshlets);
  const visiblityBuffer = createMeshletsVisiblityBuffer(
    device,
    allWIPMeshlets,
    getInstancesCount(instancesGrid)
  );
  const instances = createInstancesData(device, instancesGrid);
  const naniteLODTree = new NaniteLODTree(
    vertexBuffer,
    vertexBufferForStorageAsVec4,
    indexBuffer,
    meshletsBuffer,
    visiblityBuffer,
    instances
  );

  // write meshlets to the LOD tree
  let indexBufferOffsetBytes = 0;
  let nextId = 0; // id in the index buffer order
  const rewriteIds = createArray(naniteLODTree.meshletCount);

  const meshletsToCheck: MeshletWIP[] = [roots[0]];
  while (meshletsToCheck.length > 0) {
    const meshlet = meshletsToCheck.shift()!; // remove 1st from queue
    if (naniteLODTree.contains(meshlet.id)) {
      continue;
    }
    const node = naniteLODTree.addMeshlet(
      meshlet,
      indexBufferOffsetBytes / BYTES_U32
    );

    // write index buffer slice
    device.queue.writeBuffer(
      indexBuffer,
      indexBufferOffsetBytes,
      meshlet.indices,
      0
    );
    indexBufferOffsetBytes += getBytesForTriangles(node.triangleCount);

    // rewrite id's to be in index buffer order
    rewriteIds[meshlet.id] = nextId;
    nextId += 1;

    // schedule child nodes processing
    meshlet.createdFrom.forEach((m) => {
      if (m) {
        meshletsToCheck.push(m);
      }
    });
  }

  // assert all added OK
  if (allWIPMeshlets.length !== naniteLODTree.allMeshlets.length) {
    // prettier-ignore
    throw new Error(`Created ${allWIPMeshlets.length} meshlets, but only ${naniteLODTree.allMeshlets.length} were added to the LOD tree? Please verify '.createdFrom' for all meshlets.`);
  }

  // fill `createdFrom`
  allWIPMeshlets.forEach((m) => {
    const node = naniteLODTree.find(m.id)!;
    m.createdFrom.forEach((mChild) => {
      const chNode = naniteLODTree.find(mChild.id);
      if (chNode !== undefined && node !== undefined) {
        node.createdFrom.push(chNode);
      } else {
        // Node not found?!
        const missing = chNode === undefined ? mChild.id : m.id;
        throw new Error(`Error finalizing nanite LOD tree. Could not find meshlet ${missing}`); // prettier-ignore
      }
    });
  });

  // rewrite id's to be in index buffer order
  // This should be the last step, as we use ids all over the place.
  // After this step, MeshletWIP[_].id !== naniteLODTree.allMeshlets[_].id
  naniteLODTree.allMeshlets.forEach((m) => {
    m.id = rewriteIds[m.id];
  });

  // upload meshlet data to the GPU for GPU visibility check/render
  naniteLODTree.finalizeCreation(device);

  STATS['Vertex buffer:'] = formatBytes(vertexBuffer.size);
  STATS['Index buffer:'] = formatBytes(indexBuffer.size);
  // TODO print other stats too
  return naniteLODTree;
}

function getMeshletTriangleCount(meshlets: MeshletWIP[]) {
  return meshlets.reduce((acc, m) => acc + getTriangleCount(m.indices), 0);
}

/** We Java now */
function createVertexBufferForStorageAsVec4(vertices: Float32Array) {
  const vertexCount = vertices.length / 3;
  const result = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i++) {
    result[i * 4] = vertices[i * 3];
    result[i * 4 + 1] = vertices[i * 3 + 1];
    result[i * 4 + 2] = vertices[i * 3 + 2];
    result[i * 4 + 3] = 1.0;
  }
  return result;
}

function createMeshletsDataBuffer(
  device: GPUDevice,
  allWIPMeshlets: MeshletWIP[]
): GPUBuffer {
  const meshletCount = allWIPMeshlets.length;
  return device.createBuffer({
    label: 'nanite-meshlets',
    size: meshletCount * GPU_MESHLET_SIZE_BYTES,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
}

function createMeshletsVisiblityBuffer(
  device: GPUDevice,
  allWIPMeshlets: MeshletWIP[],
  instanceCount: number
): GPUBuffer {
  const bottomMeshletCount = allWIPMeshlets.filter(
    (m) => m.lodLevel === 0
  ).length;
  return device.createBuffer({
    label: 'nanite-visiblity',
    size: bottomMeshletCount * BYTES_UVEC2 * instanceCount,
    usage:
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC, // TODO SRC is only for tests
  });
}

function createInstancesData(
  device: GPUDevice,
  grid: InstancesGrid
): NaniteInstancesData {
  const transformsBuffer = device.createBuffer({
    label: 'nanite-transforms',
    size: BYTES_MAT4 * grid.xCnt * grid.yCnt,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const transforms: Array<mat4.Mat4> = [];

  let offsetBytes = 0;
  for (let x = 0; x < grid.xCnt; x++) {
    for (let y = 0; y < grid.yCnt; y++) {
      const tfx = mat4.translation([-x * grid.offset, 0, -y * grid.offset]);
      transforms.push(tfx);
      writeMatrixToGPUBuffer(device, transformsBuffer, offsetBytes, tfx);
      offsetBytes += BYTES_MAT4;
    }
  }

  return { transforms, transformsBuffer };
}
