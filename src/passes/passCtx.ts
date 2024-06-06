import { Mat4 } from 'wgpu-matrix';
import { GpuProfiler } from '../gpuProfiler.ts';
import { Dimensions } from '../utils/index.ts';
import { Scene } from '../scene.ts';

export interface PassCtx {
  device: GPUDevice;
  cmdBuf: GPUCommandEncoder;
  mvpMatrix: Mat4;
  viewMatrix: Mat4;
  projMatrix: Mat4;
  profiler: GpuProfiler | undefined;
  viewport: Dimensions;
  scene: Scene;
  depthTexture: GPUTexture;
}
