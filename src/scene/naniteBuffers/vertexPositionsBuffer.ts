import { CONFIG } from '../../constants.ts';
import { createGPUBuffer } from '../../utils/webgpu.ts';
import {
  BUFFER_VERTEX_POSITIONS_QUANT,
  createNaniteVertexPositionsBuffer_Quant,
} from './vertexPositionsQuantBuffer.ts';

const USE_QUANTIZATION = CONFIG.useVertexQuantization;

///////////////////////////
/// SHADER CODE
///////////////////////////

const BUFFER_VERTEX_POSITIONS_NATIVE = (bindingIdx: number) => /* wgsl */ `

// WARNING: SSBO with 'array<vec3f>' does not work. Forces 'array<vec4f>'.
// DO NOT ASK HOW I HAVE DEBUGGED THIS.
@group(0) @binding(${bindingIdx})
var<storage, read> _vertexPositionsNative: array<vec4f>;

fn _getVertexPosition(idx: u32) -> vec4f { return _vertexPositionsNative[idx]; }
`;

export const BUFFER_VERTEX_POSITIONS = USE_QUANTIZATION
  ? BUFFER_VERTEX_POSITIONS_QUANT
  : BUFFER_VERTEX_POSITIONS_NATIVE;

///////////////////////////
/// GPU BUFFER
///////////////////////////

function createNaniteVertexPositionsBuffer_Native(
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

export const createNaniteVertexPositionsBuffer = USE_QUANTIZATION
  ? createNaniteVertexPositionsBuffer_Quant
  : createNaniteVertexPositionsBuffer_Native;
