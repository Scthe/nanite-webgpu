import { BYTES_U32, BYTES_UVEC2 } from '../../constants.ts';
import { MeshletWIP } from '../../meshPreprocessing/index.ts';
import { createArray } from '../../utils/index.ts';
import {
  WEBGPU_MINIMAL_BUFFER_SIZE,
  downloadBuffer,
} from '../../utils/webgpu.ts';
import { BOTTOM_LEVEL_NODE, NaniteObject } from '../naniteObject.ts';

///////////////////////////
/// SHADER CODE
///
/// NOTE: Drawn meshlets list contains vec2u(transformMatrixId, meshletId) entries.
///       Each such entry will be drawn either by hardware XOR software rasterizer.
///       Same entry will NEVER exist on both lists at same time. We allocate
///       as if we had to drawn most detailed LOD for all instances.
///       At the start of the list are items hardware rasterized. At end - software.
///////////////////////////

/** Drawn meshlets params - hardware */
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

/** Drawn meshlets params - software */
export const BUFFER_DRAWN_MESHLETS_SW_PARAMS = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPUComputePassEncoder/dispatchWorkgroupsIndirect */
struct DrawnMeshletsSw{
  // dispatch params
  workgroupsX: u32, // modified only by globalId=0
  workgroupsY: ${access === 'read' ? 'u32' : 'atomic<u32>'},
  workgroupsZ: u32, // not modified
  /** when not limited by dispatch workgroup requirements */
  actuallyDrawnMeshlets: ${access === 'read' ? 'u32' : 'atomic<u32>'},
}
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletsSwParams: DrawnMeshletsSw;
`;
export const BYTES_DRAWN_MESHLETS_SW_PARAMS = Math.max(
  WEBGPU_MINIMAL_BUFFER_SIZE,
  4 * BYTES_U32
);

const storeUtilFns = /* wgsl */ `

fn _storeMeshletHardwareDraw(idx: u32, tfxIdx: u32, meshletIdx: u32) {
  _drawnMeshletsList[idx] = vec2u(tfxIdx, meshletIdx);
}
fn _storeMeshletSoftwareDraw(idx: u32, tfxIdx: u32, meshletIdx: u32) {
  let len: u32 = arrayLength(&_drawnMeshletsList);
  let idx2: u32 = len - 1u - idx; // stored at the back of the list
  _drawnMeshletsList[idx2] = vec2u(tfxIdx, meshletIdx);
}
`;

const loadUtilFns = /* wgsl */ `
fn _getMeshletHardwareDraw(idx: u32) -> vec2u {
  return _drawnMeshletsList[idx];
}
fn _getMeshletSoftwareDraw(idx: u32) -> vec2u {
  let len: u32 = arrayLength(&_drawnMeshletsList);
  let idx2: u32 = len - 1u - idx; // stored at the back of the list
  return _drawnMeshletsList[idx2];
}
`;

/** HUGE list of possible entries */
export const BUFFER_DRAWN_MESHLETS_LIST = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletsList: array<vec2<u32>>;

// WGSL compile error if we even HAVE (not ever called) code for 'write' if access is 'read'
${access == 'read' ? loadUtilFns : storeUtilFns}
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
  const listSize = bottomMeshletCount * instanceCount * BYTES_UVEC2;

  return device.createBuffer({
    label: `${name}-nanite-drawn-meshlets`,
    size:
      BYTES_DRAWN_MESHLETS_PARAMS + BYTES_DRAWN_MESHLETS_SW_PARAMS + listSize,
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
  const gpuBuffer = naniteObject.buffers.drawnMeshletsBuffer;

  const data = await downloadBuffer(device, Uint32Array, gpuBuffer);
  const result = parseDrawnMeshletsBuffer(data);

  console.log(`[${naniteObject.name}] Drawn meshlets buffer`, result);
  return result;
}

export function parseDrawnMeshletsBuffer(data: Uint32Array) {
  // u32's used by params
  const paramsOffset =
    (BYTES_DRAWN_MESHLETS_PARAMS + BYTES_DRAWN_MESHLETS_SW_PARAMS) / BYTES_U32;

  // parse uvec2 into something I won't forget next day
  // remember:
  // 1) it's uvec2,
  // 2) the buffer has a lot of space, we do not use it whole
  const getDrawByIdx = (idx: number) => ({
    transformId: data[paramsOffset + 2 * idx],
    meshletId: data[paramsOffset + 2 * idx + 1],
  });

  // hardware draw
  const indirectDraw = data.slice(0, 4);
  const meshletCount = indirectDraw[1];
  const meshletIds = createArray(meshletCount).map((_, i) => getDrawByIdx(i));

  // software draw
  const swOffset = BYTES_DRAWN_MESHLETS_PARAMS / BYTES_U32;
  const indirectDispatch = data.slice(swOffset, swOffset + 4);
  const actuallyDrawnMeshlets = indirectDispatch[3];
  const listLen = (data.length - paramsOffset) / 2; // in uvec2's
  const swMeshletIds = createArray(actuallyDrawnMeshlets).map((_, i) =>
    getDrawByIdx(listLen - 1 - i)
  );

  return {
    hardwareRaster: {
      vertexCount: indirectDraw[0],
      meshletCount, // indirect draw's instanceCount
      firstVertex: indirectDraw[2],
      firstInstance: indirectDraw[3],
      meshletIds,
    },
    softwareRaster: {
      workgroupsX: indirectDispatch[0], // triangleIds / SHADER_PARAMS.workgroupSizeX
      workgroupsY: indirectDispatch[1],
      workgroupsZ: indirectDispatch[2],
      meshletCount: actuallyDrawnMeshlets,
      meshletIds: swMeshletIds,
    },
  };
}
