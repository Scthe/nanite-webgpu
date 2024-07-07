import { BYTES_U32, BYTES_UVEC2 } from '../../constants.ts';
import { MeshletWIP } from '../../meshPreprocessing/index.ts';
import { WEBGPU_MINIMAL_BUFFER_SIZE } from '../../utils/webgpu.ts';
import { BOTTOM_LEVEL_NODE } from '../naniteObject.ts';

///////////////////////////
/// SHADER CODE
/// | TODO clear on CPU, then assign base stats in shader?
/// TODO add this buffer to memory stats
/// TODO [CRITICAL] this can be stored at the end of the drawn meshlets (hardware) buffer, to not allocate 2x the memory. Meshlet cannot be in 2 lists at once.
/// TODO download this buffer to add to stats. ATM rendered stats only consider hw rendering
///////////////////////////

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

export const BUFFER_DRAWN_MESHLETS_SW_LIST = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletsSwList: array<vec2u>;
`;

///////////////////////////
/// GPU BUFFER
///////////////////////////

export function createDrawnMeshletsSwBuffer(
  device: GPUDevice,
  name: string,
  allWIPMeshlets: MeshletWIP[],
  instanceCount: number
): GPUBuffer {
  const bottomMeshletCount = allWIPMeshlets.filter(
    (m) => m.lodLevel === BOTTOM_LEVEL_NODE
  ).length;
  const bytesList = bottomMeshletCount * instanceCount * BYTES_UVEC2;

  return device.createBuffer({
    label: `${name}-nanite-drawn-meshlets-sw`,
    size: BYTES_DRAWN_MESHLETS_SW_PARAMS + bytesList,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.INDIRECT |
      GPUBufferUsage.COPY_DST |
      GPUBufferUsage.COPY_SRC, // for stats, debug etc.
  });
}
