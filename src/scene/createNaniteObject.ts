import { Mat4, mat4 } from 'wgpu-matrix';
import {
  BYTES_MAT4,
  BYTES_U32,
  BYTES_UVEC2,
  CONFIG,
  InstancesGrid,
  getInstancesCount,
} from '../constants.ts';
import {
  BOTTOM_LEVEL_NODE,
  GPU_MESHLET_SIZE_BYTES,
  NaniteInstancesData,
  NaniteObject,
  getPreNaniteStats,
} from '../scene/naniteObject.ts';
import {
  createArray,
  formatBytes,
  formatNumber,
  getBytesForTriangles,
  getTriangleCount,
} from '../utils/index.ts';
import {
  BYTES_DRAW_INDIRECT,
  createGPUBuffer,
  writeMatrixToGPUBuffer,
} from '../utils/webgpu.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { STATS } from '../sys_web/stats.ts';

export function createNaniteObject(
  device: GPUDevice,
  vertexBuffer: GPUBuffer,
  rawVertices: Float32Array,
  allWIPMeshlets: MeshletWIP[],
  instancesGrid: InstancesGrid
): NaniteObject {
  const lodLevels = 1 + Math.max(...allWIPMeshlets.map((m) => m.lodLevel)); // includes LOD level 0
  const roots = allWIPMeshlets.filter((m) => m.lodLevel === lodLevels - 1);
  if (roots.length !== 1) {
    // prettier-ignore
    throw new Error(`Expected 1 Nanite LOD tree root, found ${roots.length}. Searched for LOD level ${lodLevels - 1}`);
  }

  // allocate single shared index buffer. Meshlets will use slices of it
  const indexBuffer = createIndexBuffer(device, allWIPMeshlets);
  const vertexBufferForStorageAsVec4 = createVertexBufferForStorageAsVec4(
    device,
    rawVertices
  );
  const meshletsBuffer = createMeshletsDataBuffer(device, allWIPMeshlets);
  const visiblityBuffer = createMeshletsVisiblityBuffer(
    device,
    allWIPMeshlets,
    getInstancesCount(instancesGrid)
  );
  const instances = createInstancesData(device, instancesGrid);
  const naniteObject = new NaniteObject(
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
  const rewriteIds = createArray(naniteObject.meshletCount);

  const meshletsToCheck: MeshletWIP[] = [roots[0]];
  while (meshletsToCheck.length > 0) {
    const meshlet = meshletsToCheck.shift()!; // remove 1st from queue
    if (naniteObject.contains(meshlet.id)) {
      continue;
    }
    const node = naniteObject.addMeshlet(
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
  if (allWIPMeshlets.length !== naniteObject.allMeshlets.length) {
    // prettier-ignore
    throw new Error(`Created ${allWIPMeshlets.length} meshlets, but only ${naniteObject.allMeshlets.length} were added to the LOD tree? Please verify '.createdFrom' for all meshlets.`);
  }

  // fill `createdFrom`
  allWIPMeshlets.forEach((m) => {
    const node = naniteObject.find(m.id)!;
    m.createdFrom.forEach((mChild) => {
      const chNode = naniteObject.find(mChild.id);
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
  naniteObject.allMeshlets.forEach((m) => {
    m.id = rewriteIds[m.id];
  });

  // upload meshlet data to the GPU for GPU visibility check/render
  naniteObject.uploadMeshletsToGPU(device);

  // print stats
  const rawStats = getPreNaniteStats(naniteObject);
  if (!CONFIG.isTest) {
    console.log('[Nanite] All meshlets:', naniteObject.allMeshlets);
    console.log('[Nanite] Root meshlet:', naniteObject.root);
    console.log(
      `[Nanite] Created LOD levels: ${naniteObject.lodLevelCount} (total ${naniteObject.meshletCount} meshlets from ${rawStats.meshletCount} bottom level meshlets)`
    );
  }

  // in-browser stats
  STATS.update('Vertex buffer', formatBytes(vertexBuffer.size));
  STATS.update('Vertex buffer2', formatBytes(vertexBufferForStorageAsVec4.size)); // prettier-ignore
  STATS.update('Index buffer', formatBytes(indexBuffer.size));
  STATS.update('Meshlets data', formatBytes(meshletsBuffer.size));
  STATS.update('Visibility buffer', formatBytes(visiblityBuffer.size));
  STATS.update('Pre-Nanite meshlets', formatNumber(rawStats.meshletCount * naniteObject.instancesCount, 1)); // prettier-ignore
  STATS.update('Pre-Nanite triangles', formatNumber(rawStats.triangleCount * naniteObject.instancesCount, 1)); // prettier-ignore

  return naniteObject;
}

function createIndexBuffer(
  device: GPUDevice,
  meshlets: MeshletWIP[]
): GPUBuffer {
  const totalTriangleCount = meshlets.reduce(
    (acc, m) => acc + getTriangleCount(m.indices),
    0
  );
  return device.createBuffer({
    label: 'nanite-index-buffer',
    size: getBytesForTriangles(totalTriangleCount),
    usage:
      GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
}

/** We Java now */
function createVertexBufferForStorageAsVec4(
  device: GPUDevice,
  vertices: Float32Array
): GPUBuffer {
  const vertexCount = vertices.length / 3;
  const data = new Float32Array(vertexCount * 4);
  for (let i = 0; i < vertexCount; i++) {
    data[i * 4] = vertices[i * 3];
    data[i * 4 + 1] = vertices[i * 3 + 1];
    data[i * 4 + 2] = vertices[i * 3 + 2];
    data[i * 4 + 3] = 1.0;
  }
  return createGPUBuffer(
    device,
    'nanite-vertex-buffer-vec4',
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    data
  );
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
    (m) => m.lodLevel === BOTTOM_LEVEL_NODE
  ).length;
  const dataSize = bottomMeshletCount * BYTES_UVEC2 * instanceCount;

  const extraUsage: GPUBufferUsageFlags = CONFIG.isTest
    ? GPUBufferUsage.COPY_SRC
    : 0;
  return device.createBuffer({
    label: 'nanite-visiblity',
    size: BYTES_DRAW_INDIRECT + dataSize,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.INDIRECT |
      GPUBufferUsage.COPY_DST |
      extraUsage,
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
  const transforms: Array<Mat4> = [];

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
