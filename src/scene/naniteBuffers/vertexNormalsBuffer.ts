import { vec3 } from 'wgpu-matrix';
import { createGPUBuffer } from '../../utils/webgpu.ts';

///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_VERTEX_NORMALS = (bindingIdx: number) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, read> _vertexNormals: array<vec2f>;

fn _getVertexNormal(idx: u32) -> vec3f {
  return decodeOctahedronNormal(_vertexNormals[idx]);
}
`;

///////////////////////////
/// GPU BUFFER
///////////////////////////

/** https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/ */
export function createOctahedronNormals(
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
