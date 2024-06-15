import { Mat4 } from 'wgpu-matrix';
import { GpuProfiler } from '../gpuProfiler.ts';
import { Dimensions } from '../utils/index.ts';
import { Scene } from '../scene/types.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';

export interface PassCtx {
  device: GPUDevice;
  cmdBuf: GPUCommandEncoder;
  vpMatrix: Mat4;
  viewMatrix: Mat4;
  projMatrix: Mat4;
  profiler: GpuProfiler | undefined;
  viewport: Dimensions;
  scene: Scene;
  depthTexture: GPUTextureView;
  screenTexture: GPUTextureView;
  globalUniforms: RenderUniformsBuffer;
}
