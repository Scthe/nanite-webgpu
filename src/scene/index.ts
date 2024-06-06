import { CO_PER_VERTEX, SceneFile, VERTS_IN_TRIANGLE } from '../constants.ts';
import { createMeshlets } from '../meshPreprocessing/createMeshlets.ts';
import { simplifyMesh } from '../meshPreprocessing/simplifyMesh.ts';
import { copyToTypedArray, printBoundingBox } from '../utils/index.ts';
import {
  createGPU_VertexBuffer,
  createGPU_IndexBuffer,
  createGPUBuffer,
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

  const meshletsObj = await createMeshletsMesh(
    device,
    originalVertices,
    originalIndices
  );
  const meshoptimizerLODs = await createMeshLODs(
    device,
    originalMesh,
    originalVertices,
    originalIndices
  );

  return { mesh: originalMesh, meshlets: meshletsObj, meshoptimizerLODs };
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
): Promise<Mesh[]> {
  const MAX_LODS = 10;
  const originalTriangleCount = getTriangleCount(originalIndices);
  const finalTargetTriangleCount = originalTriangleCount / 10;
  let triangleCount = originalTriangleCount;
  const meshLODs = [originalMesh];

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
    console.log(
      `LOD [${level}] (${triangleCount}->${newTriangleCount})`,
      simplifiedMesh
    );
    triangleCount = newTriangleCount;

    const indexBuffer = createGPU_IndexBuffer(
      device,
      `lod-test-index-buffer-${level}`,
      simplifiedMesh.indexBuffer
    );
    meshLODs.push({
      vertexBuffer: originalMesh.vertexBuffer,
      indexBuffer,
      ...getTriangleAndVertCounts(vertices, simplifiedMesh.indexBuffer),
    });
  }

  return meshLODs;
}

async function createMeshletsMesh(
  device: GPUDevice,
  vertices: Float32Array,
  indices: Uint32Array
): Promise<MeshletRenderPckg> {
  const meshlets = await createMeshlets(vertices, indices, {});

  const meshlet_positions: number[] = [];
  const meshlet_indices: number[] = [];
  for (let i = 0; i < meshlets.meshlets.length; i++) {
    const meshlet = meshlets.meshlets[i];
    const prevVertsCount = meshlet_positions.length / CO_PER_VERTEX;

    for (let v = 0; v < meshlet.vertexCount; v++) {
      const o =
        CO_PER_VERTEX * meshlets.meshletVertices[meshlet.vertexOffset + v];
      meshlet_positions.push(vertices[o]);
      meshlet_positions.push(vertices[o + 1]);
      meshlet_positions.push(vertices[o + 2]);
    }
    for (let t = 0; t < meshlet.triangleCount * VERTS_IN_TRIANGLE; t++) {
      const o = meshlet.triangleOffset + t;
      const idxInsideMeshlet = meshlets.meshletTriangles[o]; // 0-63
      meshlet_indices.push(prevVertsCount + idxInsideMeshlet);
    }
    /* Reuse old vertex buffer (draft)
    for (let t = 0; t < meshlet.triangleCount * VERTS_IN_TRIANGLE; t++) {
      const o = meshlet.triangleOffset + t;
      const idxInsideMeshlet = meshlets.meshletTriangles[o]; // 0-63
      const vertIdx =
        meshlets.meshletVertices[prevVertsCount + idxInsideMeshlet];
      meshlet_indices.push(vertIdx);
    }*/
  }
  const meshletVertices = copyToTypedArray(Float32Array, meshlet_positions);
  const meshletIndices = copyToTypedArray(Uint32Array, meshlet_indices);
  // printMinMax('meshletVertices', meshletVertices);
  // printMinMax('meshletIndices', meshletIndices);

  const meshletVertexBuffer = createGPUBuffer(
    device,
    'meshlets-vertices',
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    meshletVertices
  );
  const meshletIndexBuffer = createGPUBuffer(
    device,
    'meshlets-indices',
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    meshletIndices
  );
  return {
    ...meshlets,
    vertexBuffer: meshletVertexBuffer,
    indexBuffer: meshletIndexBuffer,
  };
}
