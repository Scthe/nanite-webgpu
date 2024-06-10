import { VERTS_IN_TRIANGLE } from '../constants.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { getTriangleCount } from '../utils/index.ts';
import { createGPU_IndexBuffer } from '../utils/webgpu.ts';

export type MeshletId = number;

export type NaniteMeshletTreeNode = Pick<
  MeshletWIP,
  | 'id'
  | 'lodLevel'
  | 'bounds'
  | 'maxSiblingsError'
  | 'parentBounds'
  | 'parentError'
> & {
  indexBuffer: GPUBuffer;
  triangleCount: number;
  createdFrom: NaniteMeshletTreeNode[];
};

export class NaniteLODTree {
  public readonly allMeshlets: Array<NaniteMeshletTreeNode> = [];

  constructor(public readonly vertexBuffer: GPUBuffer) {}

  find = (id: MeshletId) => this.allMeshlets.find((m) => m.id === id);

  contains = (id: MeshletId) => this.find(id) !== undefined;

  get lodLevelCount() {
    return 1 + this.root.lodLevel;
  }

  get root() {
    return this.allMeshlets[0];
  }

  get totalTriangleCount() {
    return this.allMeshlets.reduce((acc, m) => acc + m.triangleCount, 0);
  }

  get totalIndicesCount() {
    return VERTS_IN_TRIANGLE * this.totalTriangleCount;
  }

  /** Used only during construction */
  addMeshlet(device: GPUDevice, m: MeshletWIP) {
    if (this.contains(m.id)) {
      return;
    }

    const indexBuffer = createGPU_IndexBuffer(
      device,
      `nanite-meshlet-${m.id}`,
      m.indices
    );
    this.allMeshlets.push({
      id: m.id,
      lodLevel: m.lodLevel,
      bounds: m.bounds,
      maxSiblingsError: m.maxSiblingsError,
      parentBounds: m.parentBounds,
      parentError: m.parentError,
      indexBuffer,
      triangleCount: getTriangleCount(m.indices),
      createdFrom: [], // filled once all nodes created in the tree
    });
  }
}
