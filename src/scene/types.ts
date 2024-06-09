import { meshopt_Meshlets } from '../meshPreprocessing/createMeshlets.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';

export interface Scene {
  // meshes for debug
  mesh: Mesh;
  meshlets: MeshletRenderPckg;
  meshoptimizerLODs: Mesh[];
  meshoptimizerMeshletLODs: MeshletRenderPckg[];
  naniteDbgLODs: NaniteLODTree;
}

export interface Mesh {
  vertexCount: number;
  triangleCount: number;

  // GPU buffers
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}

export type MeshletRenderPckg = meshopt_Meshlets & {
  // GPU buffers
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
};

// export type NaniteMeshletTreeNode = { // TODO restore?
// indexBuffer: GPUBuffer;
// triangleCount: number;
// };
export type NaniteMeshletTreeNode = MeshletWIP;

export type NaniteLODTree = {
  vertexBuffer: GPUBuffer;
  // naniteDbgLODs: Array<NaniteMeshletTreeNode[]>;
  naniteDbgLODs: Array<NaniteMeshletTreeNode>;
};

export const getMaxNaniteLODLevel = (t: NaniteLODTree) =>
  Math.max(...t.naniteDbgLODs.map((m) => m.lodLevel));
