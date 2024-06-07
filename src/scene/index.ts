import { CO_PER_VERTEX, SceneFile, VERTS_IN_TRIANGLE } from '../constants.ts';
import {
  createMeshlets,
  meshletIndicesWithOriginalVertexBuffer,
} from '../meshPreprocessing/createMeshlets.ts';
import { simplifyMesh } from '../meshPreprocessing/simplifyMesh.ts';
import { printBoundingBox } from '../utils/index.ts';
import {
  createGPU_VertexBuffer,
  createGPU_IndexBuffer,
} from '../utils/webgpu.ts';
import { loadObjFile } from './objLoader.ts';
import { Mesh, MeshletRenderPckg, Scene } from './types.ts';

const getTriangleCount = (indices: Uint32Array | number) =>
  typeof indices === 'number'
    ? indices / VERTS_IN_TRIANGLE
    : indices.length / VERTS_IN_TRIANGLE;
const getVertexCount = (verts: Float32Array | number) =>
  typeof verts === 'number'
    ? verts / CO_PER_VERTEX
    : verts.length / CO_PER_VERTEX;

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
    ([lodMesh, indices]) => {
      return createMeshletsMesh(device, lodMesh, originalVertices, indices);
    }
  );
  const meshoptimizerMeshletLODs = await Promise.all(
    meshoptimizerMeshletLODsAsync
  );

  return {
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
  const vertexBuffer = createGPU_VertexBuffer(device, 'vertices', vertices);
  const indexBuffer = createGPU_IndexBuffer(device, 'indices', indices);
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

    // TODO use last indices instead of original mesh
    const targetIndexCount = (triangleCount * VERTS_IN_TRIANGLE) / 2;
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
      `lod-test-index-buffer-${level}`,
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
  indices: Uint32Array
): Promise<MeshletRenderPckg> {
  const meshlets = await createMeshlets(vertices, indices, {});

  const meshletIndices = meshletIndicesWithOriginalVertexBuffer(meshlets);

  const meshletIndexBuffer = createGPU_IndexBuffer(
    device,
    'meshlets-indices',
    meshletIndices
  );

  return {
    ...meshlets,
    vertexBuffer: originalMesh.vertexBuffer, // reuse <3
    indexBuffer: meshletIndexBuffer,
  };
}
