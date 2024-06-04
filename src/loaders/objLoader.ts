import * as objLoader from 'webgl-obj-loader';
import { Mesh as MyMesh } from '../mesh.ts';
import { createGPUBuffer } from '../utils/webgpu.ts';
import { copyToTypedArray, printBoundingBox } from '../utils/index.ts';
import { createArray } from '../utils/index.ts';
import { CONFIG } from '../constants.ts';

const Mesh = objLoader.default?.Mesh || objLoader.Mesh; // deno vs chrome

export function loadObjFile(device: GPUDevice, objText: string): MyMesh {
  const mesh = new Mesh(objText);
  const { vertices, indices } = mesh;
  // console.log('vertices', vertices.length);
  // console.log('indices', indices.length);

  const vertexVec4 = vec3ToVec4(vertices, CONFIG.meshScale);
  const vertexF32 = copyToTypedArray(Float32Array, vertexVec4);
  const vertexBuffer = createGPUBuffer(
    device,
    'vertices',
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    vertexF32
  );

  const indexU32 = copyToTypedArray(Uint32Array, indices);
  const indexBuffer = createGPUBuffer(
    device,
    'indices',
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    indexU32
  );

  const vertexCount = vertexVec4.length / 4;
  const triangleCount = indices.length / 3;
  console.log(
    `Parsed file: ${triangleCount} triangles, ${vertexCount} vertices`,
    {
      vertexBuffer,
      indexBuffer,
    }
  );
  printBoundingBox(vertexF32);

  return {
    indexBuffer,
    vertexBuffer,
    vertexCount,
    triangleCount,
  };
}

function vec3ToVec4(vertices: number[], scale: number) {
  const vertCnt = vertices.length / 3;
  const vec4s = createArray(vertCnt * 4);

  for (let i = 0; i < vertCnt; i++) {
    vec4s[i * 4] = vertices[i * 3] * scale;
    vec4s[i * 4 + 1] = vertices[i * 3 + 1] * scale;
    vec4s[i * 4 + 2] = vertices[i * 3 + 2] * scale;
    vec4s[i * 4 + 3] = 1;
  }

  return vec4s;
}
