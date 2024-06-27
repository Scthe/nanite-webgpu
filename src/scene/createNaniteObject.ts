import { Mat4, mat4, vec3 } from 'wgpu-matrix';
import { BYTES_MAT4, BYTES_U32, BYTES_UVEC2, CONFIG } from '../constants.ts';
import {
  BOTTOM_LEVEL_NODE,
  GPU_MESHLET_SIZE_BYTES,
  NaniteInstancesData,
  NaniteMeshletTreeNode,
  NaniteObject,
  getPreNaniteStats,
} from '../scene/naniteObject.ts';
import {
  createArray,
  dgr2rad,
  formatBytes,
  formatNumber,
  getBytesForTriangles,
  getTriangleCount,
  randomBetween,
} from '../utils/index.ts';
import {
  BYTES_DRAW_INDIRECT,
  createGPUBuffer,
  writeMatrixToGPUBuffer,
} from '../utils/webgpu.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { STATS } from '../sys_web/stats.ts';
import { InstancesGrid, getInstancesCount } from './sceneFiles.ts';
import { calculateBounds } from '../utils/calcBounds.ts';
import { GPUMesh } from './debugMeshes.ts';
import { ParsedMesh } from './objLoader.ts';
import { assertValidNaniteObject } from './utils/assertValidNaniteObject.ts';

export function createNaniteObject(
  device: GPUDevice,
  name: string,
  originalMesh: GPUMesh,
  loadedObj: ParsedMesh,
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
  const indexBuffer = createIndexBuffer(device, name, allWIPMeshlets);
  const vertexBufferForStorageAsVec4 = createVertexBufferForStorageAsVec4(
    device,
    name,
    loadedObj.positions
  );
  const octahedronNormals = createOctahedronNormals(
    device,
    name,
    loadedObj.normals
  );
  const meshletsBuffer = createMeshletsDataBuffer(device, name, allWIPMeshlets);
  const visiblityBuffer = createMeshletsVisiblityBuffer(
    device,
    name,
    allWIPMeshlets,
    getInstancesCount(instancesGrid)
  );
  const instances = createInstancesData(device, name, instancesGrid);
  const bounds = calculateBounds(loadedObj.positions);
  const naniteObject = new NaniteObject(
    name,
    bounds,
    originalMesh,
    vertexBufferForStorageAsVec4,
    octahedronNormals,
    indexBuffer,
    meshletsBuffer,
    visiblityBuffer,
    instances
  );

  // write meshlets to the LOD tree
  let indexBufferOffsetBytes = 0;
  let nextId = 0; // id in the index buffer order
  const rewriteIds = createArray(naniteObject.meshletCount);

  // array of [parentNode, meshletToCheck]
  const root = roots[0];
  const meshletsToCheck: Array<
    [NaniteMeshletTreeNode | undefined, MeshletWIP]
  > = [[undefined, root]];

  while (meshletsToCheck.length > 0) {
    const [parentNode, meshlet] = meshletsToCheck.shift()!; // remove 1st from queue
    if (naniteObject.contains(meshlet.id)) {
      continue;
    }

    // create meshlet
    const ownBounds = calculateBounds(loadedObj.positions, meshlet.indices);
    const node = naniteObject.addMeshlet(
      parentNode,
      meshlet,
      indexBufferOffsetBytes / BYTES_U32,
      ownBounds
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
        meshletsToCheck.push([node, m]);
      }
    });
  }

  // assert all added OK
  if (allWIPMeshlets.length !== naniteObject.allMeshlets.length) {
    // prettier-ignore
    throw new Error(`Created ${allWIPMeshlets.length} meshlets, but only ${naniteObject.allMeshlets.length} were added to the LOD tree? Please verify '.createdFrom' for all meshlets.`);
  }

  // rewrite id's to be in index buffer order
  // This should be the last step, as we use ids all over the place.
  // After this step, MeshletWIP[_].id !== naniteLODTree.allMeshlets[_].id
  naniteObject.allMeshlets.forEach((m) => {
    m.id = rewriteIds[m.id];
  });

  // upload meshlet data to the GPU for GPU visibility check/render
  naniteObject.uploadMeshletsToGPU(device);

  // finalize
  assertValidNaniteObject(naniteObject);

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
  STATS.update('Vertex buffer', formatBytes(originalMesh.vertexBuffer.size));
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
  name: string,
  meshlets: MeshletWIP[]
): GPUBuffer {
  const totalTriangleCount = meshlets.reduce(
    (acc, m) => acc + getTriangleCount(m.indices),
    0
  );
  return device.createBuffer({
    label: `${name}-nanite-index-buffer`,
    size: getBytesForTriangles(totalTriangleCount),
    usage:
      GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
}

/** We Java now */
function createVertexBufferForStorageAsVec4(
  device: GPUDevice,
  name: string,
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
    `${name}-nanite-vertex-buffer-vec4`,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    data
  );
}

/** https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/ */
function createOctahedronNormals(
  device: GPUDevice,
  name: string,
  normals: Float32Array
): GPUBuffer {
  const vertexCount = normals.length / 3;
  const data = new Float32Array(vertexCount * 2);
  const n = vec3.create();

  for (let i = 0; i < vertexCount; i++) {
    vec3.set(normals[i * 3], normals[i * 3 + 1], normals[i * 3 + 2], n);
    const a = Math.abs(n[0]) + Math.abs(n[1]) + Math.abs(n[2]);
    vec3.mulScalar(n, 1 / a, n);
    if (n[2] < 0) {
      // OctWrap
      const x = n[0];
      const y = n[1];
      n[0] = (1.0 - Math.abs(y)) * (x >= 0.0 ? 1.0 : -1.0);
      n[1] = (1.0 - Math.abs(x)) * (y >= 0.0 ? 1.0 : -1.0);
    }
    data[2 * i] = n[0] * 0.5 + 0.5;
    data[2 * i + 1] = n[1] * 0.5 + 0.5;
  }
  return createGPUBuffer(
    device,
    `${name}-nanite-octahedron-normals`,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    data
  );
}

function createMeshletsDataBuffer(
  device: GPUDevice,
  name: string,
  allWIPMeshlets: MeshletWIP[]
): GPUBuffer {
  const meshletCount = allWIPMeshlets.length;
  return device.createBuffer({
    label: `${name}-nanite-meshlets`,
    size: meshletCount * GPU_MESHLET_SIZE_BYTES,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
}

function createMeshletsVisiblityBuffer(
  device: GPUDevice,
  name: string,
  allWIPMeshlets: MeshletWIP[],
  instanceCount: number
): GPUBuffer {
  const bottomMeshletCount = allWIPMeshlets.filter(
    (m) => m.lodLevel === BOTTOM_LEVEL_NODE
  ).length;
  const dataSize = bottomMeshletCount * BYTES_UVEC2 * instanceCount;

  return device.createBuffer({
    label: `${name}-nanite-visiblity`,
    size: BYTES_DRAW_INDIRECT + dataSize,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.INDIRECT |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC, // for stats, debug etc.
  });
}

function createInstancesData(
  device: GPUDevice,
  name: string,
  grid: InstancesGrid
): NaniteInstancesData {
  const transformsBuffer = device.createBuffer({
    label: `${name}-nanite-transforms`,
    size: BYTES_MAT4 * grid.xCnt * grid.yCnt,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const transforms: Array<Mat4> = [];

  let offsetBytes = 0;
  for (let x = 0; x < grid.xCnt; x++) {
    for (let y = 0; y < grid.yCnt; y++) {
      const moveMat = mat4.translation([
        -x * grid.spacing,
        0,
        -y * grid.spacing,
      ]);
      const angleDgr = x == 0 && y == 0 ? 0 : randomBetween(0, 360);
      // const angleDgr = x * -90; // use if you just want to have preview for other angles
      const rotMat = mat4.rotationY(dgr2rad(angleDgr));
      const tfxMat = mat4.multiply(moveMat, rotMat);

      transforms.push(tfxMat);
      writeMatrixToGPUBuffer(device, transformsBuffer, offsetBytes, tfxMat);
      offsetBytes += BYTES_MAT4;
    }
  }

  return { transforms, transformsBuffer };
}
