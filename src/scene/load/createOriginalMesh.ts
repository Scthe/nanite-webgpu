import { getVertexCount, getTriangleCount } from '../../utils/index.ts';
import {
  createGPU_VertexBuffer,
  createGPU_IndexBuffer,
} from '../../utils/webgpu.ts';
import { GPUOriginalMesh } from '../GPUOriginalMesh.ts';
import { ParsedMesh } from '../objLoader.ts';

export function createOriginalMesh(
  device: GPUDevice,
  sceneName: string,
  mesh: ParsedMesh
): GPUOriginalMesh {
  const vertexBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-vertices`,
    mesh.positions
  );
  const normalsBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-normals`,
    mesh.normals
  );
  const uvBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-uvs`,
    mesh.uv,
    GPUBufferUsage.STORAGE
  );
  const indexBuffer = createGPU_IndexBuffer(
    device,
    `${sceneName}-original-indices`,
    mesh.indices
  );
  return {
    indexBuffer,
    uvBuffer,
    normalsBuffer,
    vertexBuffer,
    vertexCount: getVertexCount(mesh.positions),
    triangleCount: getTriangleCount(mesh.indices),
  };
}
