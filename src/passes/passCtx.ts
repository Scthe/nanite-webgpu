import { Mat4 } from 'wgpu-matrix';
import { GpuProfiler } from '../gpuProfiler.ts';
import { Dimensions } from '../utils/index.ts';
import { Scene } from '../scene/scene.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';
import { Frustum } from '../utils/frustum.ts';

export interface PassCtx {
  device: GPUDevice;
  cmdBuf: GPUCommandEncoder;
  vpMatrix: Mat4;
  viewMatrix: Mat4;
  projMatrix: Mat4;
  cameraFrustum: Frustum;
  profiler: GpuProfiler | undefined;
  viewport: Dimensions;
  scene: Scene;
  depthTexture: GPUTextureView;
  screenTexture: GPUTextureView;
  globalUniforms: RenderUniformsBuffer;
}
