import { mat4 } from 'wgpu-matrix';
import {
  BYTES_MAT4,
  SCENES,
  SceneDesc,
  SceneFile,
  VERTS_IN_TRIANGLE,
} from '../constants.ts';
import { createMeshlets } from '../meshPreprocessing/createMeshlets.ts';
import {
  createNaniteLODTree,
  createNaniteMeshlets,
} from '../meshPreprocessing/index.ts';
import { simplifyMesh } from '../meshPreprocessing/simplifyMesh.ts';
import {
  getTriangleCount,
  getVertexCount,
  printBoundingBox,
} from '../utils/index.ts';
import {
  createGPU_VertexBuffer,
  createGPU_IndexBuffer,
} from '../utils/webgpu.ts';
import { loadObjFile } from './objLoader.ts';
import { Mesh, MeshletRenderPckg, Scene } from './types.ts';
import { writeMatrixToGPUBuffer } from '../utils/webgpu.ts';

const getTriangleAndVertCounts = (
  vertices: Float32Array,
  indices: Uint32Array
): Pick<Mesh, 'triangleCount' | 'vertexCount'> => ({
  vertexCount: getVertexCount(vertices),
  triangleCount: getTriangleCount(indices),
});

export async function loadScene(
  device: GPUDevice,
  sceneName: SceneFile,
  objText: string,
  scale: number
): Promise<Scene> {
  const [originalVertices, originalIndices] = await loadObjFile(objText, scale);
  // prettier-ignore
  console.log(`Scene '${sceneName}': ${getVertexCount(originalVertices)} vertices, ${getTriangleCount(originalIndices)} triangles`);
  printBoundingBox(originalVertices);

  const originalMesh = createOriginalMesh(
    device,
    originalVertices,
    originalIndices
  );

  const meshlets = await createMeshletsMesh(
    device,
    originalMesh,
    originalVertices,
    originalIndices
  );

  const meshoptimizerLODs = await createMeshLODs(
    device,
    originalMesh,
    originalVertices,
    originalIndices
  );

  const meshoptimizerMeshletLODsAsync = meshoptimizerLODs.map(
    ([lodMesh, indices], level) => {
      return createMeshletsMesh(
        device,
        lodMesh,
        originalVertices,
        indices,
        `-lod${level}`
      );
    }
  );
  const meshoptimizerMeshletLODs = await Promise.all(
    meshoptimizerMeshletLODsAsync
  );

  const naniteMeshlets = await createNaniteMeshlets(
    originalVertices,
    originalIndices
  );
  const naniteObject = createNaniteLODTree(
    device,
    originalMesh.vertexBuffer,
    originalVertices,
    naniteMeshlets
  );
  const naniteInstances = createInstances(device, SCENES[sceneName]);

  return {
    naniteObject,
    naniteInstances,
    mesh: originalMesh,
    meshlets,
    meshoptimizerLODs: meshoptimizerLODs.map((e) => e[0]),
    meshoptimizerMeshletLODs,
  };
}

function createOriginalMesh(
  device: GPUDevice,
  vertices: Float32Array,
  indices: Uint32Array
): Mesh {
  const vertexBuffer = createGPU_VertexBuffer(
    device,
    'original-vertices',
    vertices
  );
  const indexBuffer = createGPU_IndexBuffer(
    device,
    'original-indices',
    indices
  );
  return {
    indexBuffer,
    vertexBuffer,
    ...getTriangleAndVertCounts(vertices, indices),
  };
}

async function createMeshLODs(
  device: GPUDevice,
  originalMesh: Mesh,
  vertices: Float32Array,
  originalIndices: Uint32Array
): Promise<Array<[Mesh, Uint32Array]>> {
  const MAX_LODS = 10;
  const originalTriangleCount = getTriangleCount(originalIndices);
  const finalTargetTriangleCount = originalTriangleCount / 10;
  let triangleCount = originalTriangleCount;
  const meshLODs: Array<[Mesh, Uint32Array]> = [];

  const addMeshLod = (mesh: Mesh, indexData: Uint32Array) => {
    meshLODs.push([mesh, indexData]);
  };
  addMeshLod(originalMesh, originalIndices);

  while (
    triangleCount > finalTargetTriangleCount &&
    meshLODs.length < MAX_LODS
  ) {
    const level = meshLODs.length;

    const targetIndexCount = (triangleCount * VERTS_IN_TRIANGLE) / 2;
    // TBH we should use last indices instead of original mesh. Though this is debug view..
    const simplifiedMesh = await simplifyMesh(vertices, originalIndices, {
      targetIndexCount,
      targetError: 0.05,
    });
    const newTriangleCount = getTriangleCount(simplifiedMesh.indexBuffer);
    if (newTriangleCount === originalTriangleCount) break; // cannot be simplified
    /*console.log(
      `LOD [${level}] (${triangleCount}->${newTriangleCount})`,
      simplifiedMesh
    );*/
    triangleCount = newTriangleCount;

    const indexBuffer = createGPU_IndexBuffer(
      device,
      `dbg-lod-test-index-buffer-${level}`,
      simplifiedMesh.indexBuffer
    );
    const meshLod = {
      vertexBuffer: originalMesh.vertexBuffer,
      indexBuffer,
      ...getTriangleAndVertCounts(vertices, simplifiedMesh.indexBuffer),
    };
    addMeshLod(meshLod, simplifiedMesh.indexBuffer);
  }

  return meshLODs;
}

async function createMeshletsMesh(
  device: GPUDevice,
  originalMesh: Mesh,
  vertices: Float32Array,
  indices: Uint32Array,
  labelSuffix: string = ''
): Promise<MeshletRenderPckg> {
  const meshlets = await createMeshlets(vertices, indices, {});

  const meshletIndexBuffer = createGPU_IndexBuffer(
    device,
    `dbg-meshlets-indices${labelSuffix}`,
    meshlets.meshletTriangles
  );

  return {
    ...meshlets,
    vertexBuffer: originalMesh.vertexBuffer, // reuse <3
    indexBuffer: meshletIndexBuffer,
  };
}

function createInstances(
  device: GPUDevice,
  sceneDesc: SceneDesc
): Scene['naniteInstances'] {
  const g = sceneDesc.grid;
  const transformsBuffer = device.createBuffer({
    label: 'nanite-transforms',
    size: BYTES_MAT4 * g.xCnt * g.yCnt,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const transforms: Array<mat4.Mat4> = [];

  let offsetBytes = 0;
  for (let x = 0; x < g.xCnt; x++) {
    for (let y = 0; y < g.yCnt; y++) {
      const tfx = mat4.translation([-x * g.offset, 0, -y * g.offset]);
      transforms.push(tfx);
      writeMatrixToGPUBuffer(device, transformsBuffer, offsetBytes, tfx);
      offsetBytes += BYTES_MAT4;
    }
  }

  return { transforms, transformsBuffer };
}
