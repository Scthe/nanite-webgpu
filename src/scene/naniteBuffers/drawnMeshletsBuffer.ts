import { BYTES_U32, BYTES_UVEC2 } from '../../constants.ts';
import { MeshletWIP } from '../../meshPreprocessing/index.ts';
import { createArray } from '../../utils/index.ts';
import {
  BYTES_DRAW_INDIRECT,
  WEBGPU_MINIMAL_BUFFER_SIZE,
  downloadBuffer,
} from '../../utils/webgpu.ts';
import { BOTTOM_LEVEL_NODE, NaniteObject } from '../naniteObject.ts';

///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_DRAWN_MESHLETS_PARAMS = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletsParams: DrawIndirect;
`;
export const BYTES_DRAWN_MESHLETS_PARAMS = Math.max(
  WEBGPU_MINIMAL_BUFFER_SIZE,
  4 * BYTES_U32
);

export const BUFFER_DRAWN_MESHLETS_LIST = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletsList: array<vec2<u32>>;
`;

///////////////////////////
/// GPU BUFFER
///////////////////////////

export function createDrawnMeshletsBuffer(
  device: GPUDevice,
  name: string,
  allWIPMeshlets: MeshletWIP[],
  instanceCount: number
): GPUBuffer {
  const bottomMeshletCount = allWIPMeshlets.filter(
    (m) => m.lodLevel === BOTTOM_LEVEL_NODE
  ).length;
  const dataSize = bottomMeshletCount * BYTES_UVEC2 * instanceCount;

  return device.createBuffer({
    label: `${name}-nanite-visiblity`,
    size: BYTES_DRAW_INDIRECT + dataSize,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.INDIRECT |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC, // for stats, debug etc.
  });
}

/**
 * WARNING: SLOW. DO NOT USE UNLESS FOR DEBUG/TEST PURPOSES.
 *
 * Kinda sucks it's async as weird things happen.
 */
export async function downloadDrawnMeshletsBuffer(
  device: GPUDevice,
  naniteObject: NaniteObject
) {
  const visiblityBuffer = naniteObject.buffers.drawnMeshletsBuffer;

  const data = await downloadBuffer(device, Uint32Array, visiblityBuffer);
  const result = parseDrawnMeshletsBuffer(naniteObject, data);

  console.log(`[${naniteObject.name}] Visibility buffer`, result);
  return result;
}

export function parseDrawnMeshletsBuffer(
  naniteObject: NaniteObject,
  data: Uint32Array
) {
  const indirectDraw = data.slice(0, 4);
  const meshletCount = indirectDraw[1];

  // remember:
  // 1) it's uvec2,
  // 2) the buffer has a lot of space, we do not use it whole
  const offset = BYTES_DRAW_INDIRECT / BYTES_U32;
  const lastWrittenIdx = 2 * meshletCount; // uvec2
  const visibilityResultArr = data.slice(offset, offset + lastWrittenIdx);
  // printTypedArray('visbilityResult', visibilityResultArr);

  // parse uvec2 into something I won't forget next day
  const meshletIds = createArray(meshletCount).map((_, i) => ({
    transformId: visibilityResultArr[2 * i],
    meshletId: visibilityResultArr[2 * i + 1],
  }));

  return { naniteObject, meshletCount, indirectDraw, meshletIds };
}
