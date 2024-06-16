import { mat4 } from 'wgpu-matrix';
import type {
  MeshletId,
  NaniteMeshletTreeNode,
} from '../../scene/naniteObject.ts';

/**
 * 1. Preallocate arrays to ease memory mgmt
 * 2. Const-time visited checks
 */
export class NaniteVisibilityBufferCPU {
  public visitedMeshlets: boolean[] = [];
  public drawnMeshlets: NaniteMeshletTreeNode[] = [];
  public drawnMesletsCount = 0;
  public mvpMatrix: mat4.Mat4 = mat4.identity();

  initialize(meshletCount: number) {
    this.visitedMeshlets = Array(meshletCount);
    this.drawnMeshlets = Array(meshletCount);
  }

  prepareForDraw() {
    // this.visitedMeshlets.fill(false);
    for (let i = 0; i < this.visitedMeshlets.length; i++) {
      this.visitedMeshlets[i] = false;
    }
    this.drawnMesletsCount = 0;
  }

  wasVisited = (id: MeshletId): boolean => this.visitedMeshlets[id];
  setVisited = (id: MeshletId) => {
    this.visitedMeshlets[id] = true;
  };

  setDrawn = (m: NaniteMeshletTreeNode) => {
    this.drawnMeshlets[this.drawnMesletsCount] = m;
    this.drawnMesletsCount += 1;
  };
}
