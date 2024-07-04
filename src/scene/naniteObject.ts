import { VERTS_IN_TRIANGLE } from '../constants.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { getTriangleCount } from '../utils/index.ts';
import { BYTES_DRAW_INDIRECT } from '../utils/webgpu.ts';
import { NaniteVisibilityBufferCPU } from '../passes/naniteCpu/types.ts';
import { Bounds3d } from '../utils/calcBounds.ts';
import { GPUMesh } from './debugMeshes.ts';
import { NaniteInstancesData } from './instancesData.ts';
import { ImpostorBillboardTexture } from './renderImpostors/renderImpostors.ts';
import { uploadMeshletsToGPU } from './naniteBuffers/meshletsDataBuffer.ts';

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
    /** GPU-flow: temporary structure between passes. Holds 1 draw indirect and `Array<(tfxId, meshletId)>` */
    private readonly visiblityBuffer: GPUBuffer,
    /** GPU-flow: Result of instance culling. Holds 1 dispatch indirect, object bounding sphere, and `Array<tfxId>` */
    public readonly drawnInstanceIdsBuffer: GPUBuffer,
    /** GPU-flow: Draw params and instanceIds for billboards. Holds 1 draw indirect and `Array<tfxId>` */
    public readonly billboardImpostorsBuffer: GPUBuffer,
    public readonly impostor: ImpostorBillboardTexture,
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

  finalizeNaniteObject(device: GPUDevice) {
    this.naniteVisibilityBufferCPU.initialize(this.meshletCount); // bonus!

    uploadMeshletsToGPU(device, this.meshletsBuffer, this.allMeshlets);
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
