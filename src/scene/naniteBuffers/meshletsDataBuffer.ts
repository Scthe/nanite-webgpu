import { BYTES_UVEC4, BYTES_VEC4 } from '../../constants.ts';
import type { NaniteMeshletTreeNode } from '../naniteObject.ts';

///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_MESHLET_DATA = (bindingIdx: number) => /* wgsl */ `

struct NaniteMeshletTreeNode {
  boundsMidPointAndError: vec4f, // sharedSiblingsBounds.xyz + maxSiblingsError
  parentBoundsMidPointAndError: vec4f, // parentBounds.xyz + parentError
  ownBoundingSphere: vec4f, // ownBounds
  triangleCount: u32,
  firstIndexOffset: u32,
  lodLevel: u32, // meshlet level + padding
  padding0: u32, // padding to fill uvec4
}
@group(0) @binding(${bindingIdx})
var<storage, read> _meshlets: array<NaniteMeshletTreeNode>;
`;

const GPU_MESHLET_SIZE_BYTES = 3 * BYTES_VEC4 + BYTES_UVEC4;

///////////////////////////
/// GPU BUFFER
///////////////////////////

export function createMeshletsDataBuffer(
  device: GPUDevice,
  name: string,
  meshletCount: number
): GPUBuffer {
  return device.createBuffer({
    label: `${name}-nanite-meshlets`,
    size: meshletCount * GPU_MESHLET_SIZE_BYTES,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
}

/** Upload final meshlet data to the GPU */
export function uploadMeshletsToGPU(
  device: GPUDevice,
  meshletsBuffer: GPUBuffer,
  allMeshlets: Array<NaniteMeshletTreeNode>
) {
  const meshletCount = allMeshlets.length;
  const actualSize = meshletCount * GPU_MESHLET_SIZE_BYTES;
  if (actualSize !== meshletsBuffer.size) {
    // prettier-ignore
    throw new Error(`GPU meshlet data preallocated ${meshletsBuffer.size} bytes, but ${actualSize} bytes (${meshletCount} meshlets * ${GPU_MESHLET_SIZE_BYTES}) are needed`);
  }

  let offsetBytes = 0;
  const data = new ArrayBuffer(GPU_MESHLET_SIZE_BYTES);
  const dataAsF32 = new Float32Array(data);
  const dataAsU32 = new Uint32Array(data);
  allMeshlets.forEach((m) => {
    dataAsF32[0] = m.sharedSiblingsBounds.center[0];
    dataAsF32[1] = m.sharedSiblingsBounds.center[1];
    dataAsF32[2] = m.sharedSiblingsBounds.center[2];
    dataAsF32[3] = m.maxSiblingsError;
    dataAsF32[4] = m.parentBounds?.center[0] || 0.0;
    dataAsF32[5] = m.parentBounds?.center[1] || 0.0;
    dataAsF32[6] = m.parentBounds?.center[2] || 0.0;
    dataAsF32[7] = m.parentError === Infinity ? 9999999.0 : m.parentError;
    // own bounds
    const ownBoundSph = m.ownBounds.sphere;
    dataAsF32[8] = ownBoundSph.center[0];
    dataAsF32[9] = ownBoundSph.center[1];
    dataAsF32[10] = ownBoundSph.center[2];
    dataAsF32[11] = ownBoundSph.radius;
    // u32's:
    dataAsU32[12] = m.triangleCount;
    dataAsU32[13] = m.firstIndexOffset;
    dataAsU32[14] = m.lodLevel;

    // write
    device.queue.writeBuffer(
      meshletsBuffer,
      offsetBytes,
      data,
      0,
      GPU_MESHLET_SIZE_BYTES
    );
    offsetBytes += GPU_MESHLET_SIZE_BYTES;
  });
}
