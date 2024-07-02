import { BYTES_U32 } from '../../constants.ts';
import { WEBGPU_MINIMAL_BUFFER_SIZE } from '../../utils/webgpu.ts';

export const SHADER_SNIPPET_BILLBOARD_DRAW_PARAMS = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _billboardDrawParams: DrawIndirect;
`;

export const SHADER_SNIPPET_BILLBOARD_ARRAY = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _billboardIdsArray: array<u32>;
`;

const BYTES_PARAMS = Math.max(WEBGPU_MINIMAL_BUFFER_SIZE, 4 * BYTES_U32);

export function createBillboardImpostorsBuffer(
  device: GPUDevice,
  name: string,
  instanceCount: number
): GPUBuffer {
  const arraySizeBytes = BYTES_U32 * instanceCount;

  // TODO [HIGH] extract this to util createStorageBuffer()
  const bufferGpu = device.createBuffer({
    label: `${name}-nanite-billboards`,
    size: BYTES_PARAMS + arraySizeBytes,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.INDIRECT |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC, // for stats, debug etc.
  });

  return bufferGpu;
}

/** zeroe the draw params (between frames) */
export function cmdClearBillboardDrawParams(
  cmdBuf: GPUCommandEncoder,
  buf: GPUBuffer
) {
  cmdBuf.clearBuffer(buf, 0, BYTES_PARAMS);
}

export const bufferBindingBillboardDrawParams = (
  buffer: GPUBuffer,
  bindingIdx: number
): GPUBindGroupEntry => ({
  binding: bindingIdx,
  resource: {
    buffer,
    offset: 0,
    size: BYTES_PARAMS,
  },
});

export const bufferBindingBillboardDrawArray = (
  buffer: GPUBuffer,
  bindingIdx: number
): GPUBindGroupEntry => ({
  binding: bindingIdx,
  resource: {
    buffer,
    offset: BYTES_PARAMS,
  },
});
