export interface Mesh {
  vertexCount: number;
  triangleCount: number;

  // GPU buffers
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}
