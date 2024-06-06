import { meshopt_Meshlets } from './meshPreprocessing/createMeshlets.ts';

export type MeshletRenderPckg = meshopt_Meshlets & {
  // GPU buffers
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
};

export interface Scene {
  mesh: Mesh;
  meshlets: MeshletRenderPckg;
}

export interface Mesh {
  vertexCount: number;
  triangleCount: number;

  // GPU buffers
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}
