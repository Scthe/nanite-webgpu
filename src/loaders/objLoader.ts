import * as objLoader from 'webgl-obj-loader';
import { Mesh as MyMesh } from '../mesh.ts';
import { createGPUBuffer } from '../utils/webgpu.ts';
import { copyToTypedArray, printBoundingBox } from '../utils/index.ts';
import { CONFIG, CO_PER_VERTEX } from '../constants.ts';
import { optimizeMeshBuffers } from '../meshPreprocessing/optimizeMeshBuffers.ts';
import { simplifyMesh } from '../meshPreprocessing/simplifyMesh.ts';

const Mesh = objLoader.default?.Mesh || objLoader.Mesh; // deno vs chrome

export async function loadObjFile(
  device: GPUDevice,
  objText: string
): Promise<MyMesh> {
  const mesh = new Mesh(objText);
  const { vertices, indices } = mesh;
  // console.log('unique vertices (may incl. normals)', vertices.length / CO_PER_VERTEX);
  // console.log('indices', indices.length);

  const vertexF32 = copyToTypedArray(
    Float32Array,
    vertices.map((e: number) => e * CONFIG.meshScale)
  );
  const indexU32 = copyToTypedArray(Uint32Array, indices);
  let [optVertices, optIndices] = await optimizeMeshBuffers(
    vertexF32,
    indexU32
  );
  // const optVertices = vertexF32;
  // const optIndices = indexU32;
  const simplifiedMesh = await simplifyMesh(optVertices, optIndices, {
    targetIndexCount: 300,
    targetError: 0.05,
  });
  console.log('SimplifiedMesh result', simplifiedMesh);
  optIndices = simplifiedMesh.indexBuffer;

  // create GPUBuffers
  const vertexBuffer = createGPUBuffer(
    device,
    'vertices',
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    optVertices
  );
  const indexBuffer = createGPUBuffer(
    device,
    'indices',
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    optIndices
  );

  const vertexCount = optVertices.length / CO_PER_VERTEX;
  const triangleCount = optIndices.length / 3;
  console.log(
    `Parsed file: ${triangleCount} triangles (${optIndices.length} indices), ${vertexCount} vertices`,
    {
      vertexBuffer,
      indexBuffer,
    }
  );
  printBoundingBox(optVertices);

  return {
    indexBuffer,
    vertexBuffer,
    vertexCount,
    triangleCount,
  };
}
