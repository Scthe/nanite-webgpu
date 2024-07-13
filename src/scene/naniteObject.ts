import { IS_DENO, VERTS_IN_TRIANGLE } from '../constants.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { getTriangleCount } from '../utils/index.ts';
import { NaniteVisibilityBufferCPU } from '../passes/naniteCpu/types.ts';
import { Bounds3d } from '../utils/calcBounds.ts';
import { NaniteInstancesData } from './instancesData.ts';
import { ImpostorBillboardTexture } from './renderImpostors/renderImpostors.ts';
import { uploadMeshletsToGPU } from './naniteBuffers/meshletsDataBuffer.ts';
import { NaniteObjectBuffers } from './naniteBuffers/index.ts';
import { GPUOriginalMesh } from './GPUOriginalMesh.ts';

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
    public readonly originalMesh: GPUOriginalMesh,
    public readonly buffers: NaniteObjectBuffers,
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
  get bottomTriangleCount() {
    return this.allMeshlets.reduce((acc, m) => {
      return m.lodLevel === BOTTOM_LEVEL_NODE ? acc + m.triangleCount : acc;
    }, 0);
  }

  /** Bottom-level meshlets. We don't want to render them, we want something higher-up the LOD tree to reduce triangle count */
  get bottomMeshletCount() {
    return this.allMeshlets.reduce((acc, m) => {
      return m.lodLevel === BOTTOM_LEVEL_NODE ? acc + 1 : acc;
    }, 0);
  }

  bindInstanceTransforms = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.instances.transformsBuffer },
  });

  finalizeNaniteObject(device: GPUDevice) {
    this.naniteVisibilityBufferCPU.initialize(this.meshletCount);

    uploadMeshletsToGPU(
      device,
      this.buffers.meshletsDataBuffer,
      this.allMeshlets
    );
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

  printStats() {
    if (!IS_DENO) {
      // prevent spam. This is literally pages long
      console.log('All meshlets:', this.allMeshlets);
      console.log('Root meshlets:', this.roots);
    }

    const trianglesBefore = this.bottomTriangleCount;
    const trianglesAfter = this.roots.reduce(
      (acc, m) => acc + m.triangleCount,
      0
    );
    const simplifPct = (trianglesAfter / trianglesBefore) * 100;

    console.log(`Created ${this.lodLevelCount} LOD levels. Total ${this.meshletCount} meshlets.`); // prettier-ignore
    console.log(`There are ${this.bottomMeshletCount} bottom level meshlets with ${trianglesBefore} triangles.`); // prettier-ignore
    console.log(`There are ${this.roots.length} root meshlets with ${trianglesAfter} triangles. Simplification: ${simplifPct.toFixed(1)}%.`); // prettier-ignore
  }
}
