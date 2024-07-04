import { createGPUBuffer } from '../../utils/webgpu.ts';

///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_VERTEX_POSITIONS = (bindingIdx: number) => /* wgsl */ `

// WARNING: SSBO with 'array<vec3f>' does not work. Forces 'array<vec4f>'.
// DO NOT ASK HOW I HAVE DEBUGGED THIS.
@group(0) @binding(${bindingIdx})
var<storage, read> _vertexPositions: array<vec4f>;

fn _getVertexPosition(idx: u32) -> vec4f { return _vertexPositions[idx]; }
`;

///////////////////////////
/// GPU BUFFER
///////////////////////////

export function createNaniteVertexPositionsBuffer(
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
