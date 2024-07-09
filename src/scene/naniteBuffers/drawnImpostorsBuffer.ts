import { BYTES_U32 } from '../../constants.ts';
import {
  WEBGPU_MINIMAL_BUFFER_SIZE,
  downloadBuffer,
} from '../../utils/webgpu.ts';
import { NaniteObject } from '../naniteObject.ts';

///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_DRAWN_IMPOSTORS_PARAMS = (
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
var<storage, ${access}> _drawnImpostorsParams: DrawIndirect;
`;

export const BUFFER_DRAWN_IMPOSTORS_LIST = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnImpostorsList: array<u32>;
`;

export const BYTES_DRAWN_IMPOSTORS_PARAMS = Math.max(
  WEBGPU_MINIMAL_BUFFER_SIZE,
  4 * BYTES_U32
);

///////////////////////////
/// GPU BUFFER
///////////////////////////

export function createDrawnImpostorsBuffer(
  device: GPUDevice,
  name: string,
  instanceCount: number
): GPUBuffer {
  const arraySizeBytes = BYTES_U32 * instanceCount;

  const bufferGpu = device.createBuffer({
    label: `${name}-nanite-billboards`,
    size: BYTES_DRAWN_IMPOSTORS_PARAMS + arraySizeBytes,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.INDIRECT |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC, // for stats, debug etc.
  });

  return bufferGpu;
}

/**
 * WARNING: SLOW. DO NOT USE UNLESS FOR DEBUG/TEST PURPOSES.
 *
 * Kinda sucks it's async as weird things happen.
 */
export async function downloadDrawnImpostorsBuffer(
  device: GPUDevice,
  naniteObject: NaniteObject
) {
  const gpuBuffer = naniteObject.buffers.drawnImpostorsBuffer;

  // TBH. we don't need whole buffer, just a single u32. But.. ehhhh..
  const data = await downloadBuffer(device, Uint32Array, gpuBuffer);
  const impostorCount = data[1];

  const listOffset = BYTES_DRAWN_IMPOSTORS_PARAMS / BYTES_U32;
  const idsList = data.slice(listOffset, listOffset + impostorCount);

  const result = {
    vertexCount: data[0],
    impostorCount,
    firstVertex: data[2],
    firstInstance: data[3],
    idsList,
  };

  console.log(`[${naniteObject.name}] Drawn impostors buffer`, result);
  return result;
}
