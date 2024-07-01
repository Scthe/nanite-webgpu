import { BYTES_U32, BYTES_VEC4 } from '../../constants.ts';
import { BoundingSphere } from '../../utils/calcBounds.ts';
import { WEBGPU_MINIMAL_BUFFER_SIZE } from '../../utils/webgpu.ts';

export const SHADER_SNIPPET_INSTANCES_CULL_PARAMS = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect */
struct CullParams{
  // dispatch params
  workgroupsX: u32, // modified only by globalId=0
  workgroupsY: ${access === 'read' ? 'u32' : 'atomic<u32>'},
  workgroupsZ: u32, // not modified
  /** when not limited by dispatch workgroup requirements */
  actuallyDrawnInstances: ${access === 'read' ? 'u32' : 'atomic<u32>'},
  // other params:
  objectBoundingSphere: vec4f,
  allMeshletsCount: u32,
}
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _cullParams: CullParams;
`;

export const SHADER_SNIPPET_INSTANCES_CULL_ARRAY = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnInstanceIdsResult: array<u32>;
`;

export const BYTES_INSTANCE_CULL_DATA = Math.max(
  WEBGPU_MINIMAL_BUFFER_SIZE,
  3 * BYTES_U32 + // dispatch itself
    BYTES_U32 + // actuallyDrawnInstances
    BYTES_U32 + // allMeshletsCount
    BYTES_VEC4 // bounding sphere
);

export function writeCullData(
  device: GPUDevice,
  bufferGpu: GPUBuffer,
  allMeshletsCount: number,
  wholeObjectBounds: BoundingSphere
) {
  // write const data
  const buffer = new ArrayBuffer(BYTES_INSTANCE_CULL_DATA);
  const bufferF32 = new Float32Array(buffer);
  const bufferU32 = new Uint32Array(buffer);

  const offset0 = 4; // dispatch indirect, in BYTES_U32
  // write bounding sphere
  bufferF32[offset0 + 0] = wholeObjectBounds.center[0];
  bufferF32[offset0 + 1] = wholeObjectBounds.center[1];
  bufferF32[offset0 + 2] = wholeObjectBounds.center[2];
  bufferF32[offset0 + 3] = wholeObjectBounds.radius;
  // allMeshletsCount
  bufferU32[offset0 + 4] = allMeshletsCount;

  // write
  device.queue.writeBuffer(bufferGpu, 0, buffer, 0, BYTES_INSTANCE_CULL_DATA);
}

export function clearDrawnInstancesFrameData(
  cmdBuf: GPUCommandEncoder,
  buf: GPUBuffer
) {
  cmdBuf.clearBuffer(buf, 0, 4 * BYTES_U32);
}

export const bufferBindingDrawnInstanceIdsParams = (
  buffer: GPUBuffer,
  bindingIdx: number
): GPUBindGroupEntry => ({
  binding: bindingIdx,
  resource: {
    buffer,
    offset: 0,
    size: BYTES_INSTANCE_CULL_DATA,
  },
});

export const bufferBindingDrawnInstanceIdsArray = (
  buffer: GPUBuffer,
  bindingIdx: number
): GPUBindGroupEntry => ({
  binding: bindingIdx,
  resource: {
    buffer,
    offset: BYTES_INSTANCE_CULL_DATA,
  },
});

export const parseDrawnInstancesBuffer = (data: Uint32Array) => {
  const dataF32 = new Float32Array(data.buffer);
  const actuallyDrawnInstances = data[3];

  const offset = BYTES_INSTANCE_CULL_DATA / BYTES_U32;
  const lastWrittenIdx = actuallyDrawnInstances;
  const instanceIds = data.slice(offset, offset + lastWrittenIdx);

  return {
    workgroupsX: data[0],
    workgroupsY: data[1],
    workgroupsZ: data[2],
    actuallyDrawnInstances,
    boundingSphere: [dataF32[4], dataF32[5], dataF32[6], dataF32[7]],
    allMeshletsCount: data[8],
    instanceIds,
  };
};
