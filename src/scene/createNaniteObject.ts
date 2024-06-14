import { Mat4, mat4 } from 'wgpu-matrix';
import {
  BYTES_MAT4,
  BYTES_U32,
  BYTES_UVEC2,
  InstancesGrid,
  STATS,
  getInstancesCount,
} from '../constants.ts';
import {
  GPU_MESHLET_SIZE_BYTES,
  NaniteInstancesData,
  NaniteObject,
} from '../scene/naniteObject.ts';
import {
  createArray,
  formatBytes,
  getBytesForTriangles,
  getTriangleCount,
} from '../utils/index.ts';
import { createGPUBuffer, writeMatrixToGPUBuffer } from '../utils/webgpu.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';

export function createNaniteObject(
  device: GPUDevice,
  vertexBuffer: GPUBuffer,
  rawVertices: Float32Array,
  allWIPMeshlets: MeshletWIP[],
  instancesGrid: InstancesGrid
): NaniteObject {
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
  const naniteLODTree = new NaniteObject(
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
