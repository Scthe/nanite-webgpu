import { Mat4, Vec3 } from 'wgpu-matrix';
import { GpuProfiler } from '../gpuProfiler.ts';
import { Dimensions } from '../utils/index.ts';
import { Scene } from '../scene/scene.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';
import { Frustum } from '../utils/frustum.ts';

export interface PassCtx {
  frameIdx: number;
  device: GPUDevice;
  cmdBuf: GPUCommandEncoder;
  vpMatrix: Mat4;
  viewMatrix: Mat4;
  projMatrix: Mat4;
  cameraFrustum: Frustum;
  cameraPositionWorldSpace: Vec3;
  profiler: GpuProfiler | undefined;
  viewport: Dimensions;
  scene: Scene;
  depthTexture: GPUTextureView;
  prevFrameDepthPyramidTexture: GPUTextureView;
  screenTexture: GPUTextureView;
  globalUniforms: RenderUniformsBuffer;
  depthPyramidSampler: GPUSampler;
}
