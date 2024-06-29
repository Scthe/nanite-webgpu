import {
  BYTES_U32,
  BYTES_UVEC4,
  BYTES_VEC4,
  VERTS_IN_TRIANGLE,
} from '../constants.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { createArray, getTriangleCount } from '../utils/index.ts';
import { BYTES_DRAW_INDIRECT } from '../utils/webgpu.ts';
import { downloadBuffer } from '../utils/webgpu.ts';
import { NaniteVisibilityBufferCPU } from '../passes/naniteCpu/types.ts';
import { Bounds3d } from '../utils/calcBounds.ts';
import { GPUMesh } from './debugMeshes.ts';
import { NaniteInstancesData } from './instancesData.ts';

export type MeshletId = number;

export type NaniteMeshletTreeNode = Pick<
  MeshletWIP,
  | 'id'
  | 'lodLevel'
  | 'sharedSiblingsBounds'
  | 'maxSiblingsError'
  | 'parentBounds'
  | 'parentError'
> & {
  triangleCount: number;
  firstIndexOffset: number;
  createdFrom: NaniteMeshletTreeNode[];
  ownBounds: Bounds3d;
};

export const SHADER_SNIPPET_MESHLET_TREE_NODES = (bindingIdx: number) => `
struct NaniteMeshletTreeNode {
  boundsMidPointAndError: vec4f, // sharedSiblingsBounds.xyz + maxSiblingsError
  parentBoundsMidPointAndError: vec4f, // parentBounds.xyz + parentError
  ownBoundingSphere: vec4f, // ownBounds
  triangleCount: u32,
  firstIndexOffset: u32,
  lodLevel: u32, // meshlet level + padding
  padding1: u32, // padding to fill uvec4
}
@group(0) @binding(${bindingIdx})
var<storage, read> _meshlets: array<NaniteMeshletTreeNode>;
`;
export const GPU_MESHLET_SIZE_BYTES = 3 * BYTES_VEC4 + BYTES_UVEC4;

export const BOTTOM_LEVEL_NODE = 0;

export class NaniteObject {
  public readonly allMeshlets: Array<NaniteMeshletTreeNode> = [];
  public readonly naniteVisibilityBufferCPU = new NaniteVisibilityBufferCPU();
  public diffuseTexture: GPUTexture | undefined = undefined;
  public diffuseTextureView: GPUTextureView | undefined = undefined;
  public roots: NaniteMeshletTreeNode[] = [];
  /** Max LOD tree level of _ONE_ of the roots. Some roots might have ended earlier */
  public lodLevelCount = 0;

  constructor(
    public name: string,
    public readonly bounds: Bounds3d,
    public readonly originalMesh: GPUMesh,
    /** SSBO with `array<vec3f>` does not work. Forces `array<vec4f>`.
     * We could also: https://momentsingraphics.de/ToyRenderer2SceneManagement.html#Quantization ,
     * but no point in complicating this demo
     */
    private readonly vertexBufferForStorageAsVec4: GPUBuffer,
    /** Encoded normals. */
    private readonly octahedronNormals: GPUBuffer,
    public readonly indexBuffer: GPUBuffer,
    /** GPU-flow: data for meshlets (NaniteMeshletTreeNode) uploaded to GPU*/
    public readonly meshletsBuffer: GPUBuffer,
    /** GPU-flow: temporary structure between passes. Holds 1 draw indirect and Array<(tfxId, meshletId)> */
    private readonly visiblityBuffer: GPUBuffer,
    public readonly instances: NaniteInstancesData
  ) {}

  find = (id: MeshletId) => this.allMeshlets.find((m) => m.id === id);

  contains = (id: MeshletId) => this.find(id) !== undefined;

  get totalTriangleCount() {
    return this.allMeshlets.reduce((acc, m) => acc + m.triangleCount, 0);
  }

  get totalIndicesCount() {
    return VERTS_IN_TRIANGLE * this.totalTriangleCount;
  }

  get meshletCount() {
    return this.allMeshlets.length;
  }

  get instancesCount() {
    return this.instances.transforms.length;
  }

  /** Triangle count as imported from .OBJ file. This is how much you would render if you did not have nanite */
  get rawObjectTriangleCount() {
    return this.allMeshlets.reduce((acc, m) => {
      return m.lodLevel === BOTTOM_LEVEL_NODE ? acc + m.triangleCount : acc;
    }, 0);
  }

  /** Bottom-level meshlets. We don't want to render them, we want something higher-up the LOD tree to reduce triangle count */
  get rawMeshletCount() {
    return this.allMeshlets.reduce((acc, m) => {
      return m.lodLevel === BOTTOM_LEVEL_NODE ? acc + 1 : acc;
    }, 0);
  }

  /** Use specialised methods for this buffer! It's complicated */
  dangerouslyGetVisibilityBuffer = () => this.visiblityBuffer;

  bufferBindingInstanceTransforms = (
    bindingIdx: number
  ): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.instances.transformsBuffer },
  });

  bufferBindingMeshlets = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.meshletsBuffer },
  });

  bufferBindingVertexBufferForStorageAsVec4 = (
    bindingIdx: number
  ): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.vertexBufferForStorageAsVec4 },
  });

  bufferBindingOctahedronNormals = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.octahedronNormals },
  });

  bufferBindingUV = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.originalMesh.uvBuffer },
  });

  bufferBindingIndexBuffer = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.indexBuffer },
  });

  get drawIndirectBuffer() {
    return this.visiblityBuffer;
  }

  bufferBindingIndirectDrawParams = (
    bindingIdx: number
  ): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.visiblityBuffer,
      offset: 0,
      size: BYTES_DRAW_INDIRECT,
    },
  });

  /** zeroe the draw params (between frames) */
  cmdClearDrawParams(cmdBuf: GPUCommandEncoder) {
    cmdBuf.clearBuffer(this.visiblityBuffer, 0, BYTES_DRAW_INDIRECT);
  }

  bufferBindingVisibility = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.visiblityBuffer,
      offset: BYTES_DRAW_INDIRECT,
    },
  });

  /** Upload final meshlet data to the GPU */
  uploadMeshletsToGPU(device: GPUDevice) {
    this.naniteVisibilityBufferCPU.initialize(this.meshletCount); // bonus!

    // ok, actual code starts now
    const actualSize = this.meshletCount * GPU_MESHLET_SIZE_BYTES;
    if (actualSize !== this.meshletsBuffer.size) {
      // prettier-ignore
      throw new Error(`GPU meshlet data preallocated ${this.meshletsBuffer.size} bytes, but ${actualSize} bytes (${this.meshletCount} meshlets * ${GPU_MESHLET_SIZE_BYTES}) are needed`);
    }

    let offsetBytes = 0;
    const data = new ArrayBuffer(GPU_MESHLET_SIZE_BYTES);
    const dataAsF32 = new Float32Array(data);
    const dataAsU32 = new Uint32Array(data);
    this.allMeshlets.forEach((m) => {
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
        this.meshletsBuffer,
        offsetBytes,
        data,
        0,
        GPU_MESHLET_SIZE_BYTES
      );
      offsetBytes += GPU_MESHLET_SIZE_BYTES;
    });
  }

  /** Used only during construction */
  addMeshlet(
    parent: NaniteMeshletTreeNode | undefined,
    m: MeshletWIP,
    firstIndexOffset: number,
    ownBounds: Bounds3d
  ) {
    const existing = this.find(m.id);
    if (existing) {
      return existing;
    }

    const node: NaniteMeshletTreeNode = {
      id: m.id,
      lodLevel: m.lodLevel,
      sharedSiblingsBounds: m.sharedSiblingsBounds,
      maxSiblingsError: m.maxSiblingsError,
      parentBounds: m.parentBounds,
      parentError: m.parentError,
      firstIndexOffset,
      triangleCount: getTriangleCount(m.indices),
      createdFrom: [], // filled when addMeshlet() is called for children
      ownBounds,
    };

    this.allMeshlets.push(node);
    this.lodLevelCount = Math.max(this.lodLevelCount, node.lodLevel + 1);

    if (parent) {
      parent.createdFrom.push(node);
    } else {
      this.roots.push(node);
    }

    return node;
  }
}

/**
 * WARNING: SLOW. DO NOT USE UNLESS FOR DEBUG/TEST PURPOSES.
 *
 * Kinda sucks it's async as weird things happen.
 */
export async function downloadVisibilityBuffer(
  device: GPUDevice,
  naniteObject: NaniteObject
) {
  const visiblityBuffer = naniteObject.dangerouslyGetVisibilityBuffer();

  const data = await downloadBuffer(device, Uint32Array, visiblityBuffer);
  const result = parseVisibilityBuffer(naniteObject, data);

  console.log(`[${naniteObject.name}] Visibility buffer`, result);
  return result;
}

export type DownloadedVisibilityBuffer = ReturnType<
  typeof parseVisibilityBuffer
>;

export function parseVisibilityBuffer(
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
