import { BYTES_MAT4, BYTES_VEC4, CONFIG } from '../constants.ts';
import {
  GPU_BUFFER_USAGE_UNIFORM,
  writeMatrixToGPUBuffer,
} from '../utils/webgpu.ts';
import { calcCotHalfFov } from './naniteCpu/calcNaniteMeshletsVisibility.ts';
import { PassCtx } from './passCtx.ts';

export class RenderUniformsBuffer {
  public static SHADER_SNIPPET = (group: number) => `
    struct Uniforms {
      vpMatrix: mat4x4<f32>,
      viewMatrix: mat4x4<f32>,
      projMatrix: mat4x4<f32>,
      viewport: vec4f,
    };
    @binding(0) @group(${group})
    var<uniform> _uniforms: Uniforms;
  `;

  public static BUFFER_SIZE =
    BYTES_MAT4 + // vpMatrix
    BYTES_MAT4 + // viewMatrix
    BYTES_MAT4 + // projMatrix
    BYTES_VEC4; // viewport

  private readonly gpuBuffer: GPUBuffer;

  constructor(device: GPUDevice) {
    this.gpuBuffer = device.createBuffer({
      label: 'render-uniforms-buffer',
      size: RenderUniformsBuffer.BUFFER_SIZE,
      usage: GPU_BUFFER_USAGE_UNIFORM,
    });
  }

  createBindingDesc = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.gpuBuffer },
  });

  update(ctx: PassCtx) {
    const { device, vpMatrix, viewMatrix, projMatrix, viewport } = ctx;
    let offsetBytes = 0;

    // TODO single write to GPU instead many tiny ones
    writeMatrixToGPUBuffer(device, this.gpuBuffer, offsetBytes, vpMatrix);
    offsetBytes += BYTES_MAT4;

    writeMatrixToGPUBuffer(device, this.gpuBuffer, offsetBytes, viewMatrix);
    offsetBytes += BYTES_MAT4;

    writeMatrixToGPUBuffer(device, this.gpuBuffer, offsetBytes, projMatrix);
    offsetBytes += BYTES_MAT4;

    // viewport as vec4
    const miscF32Array = new Float32Array([
      viewport.width,
      viewport.height,
      CONFIG.nanite.render.pixelThreshold,
      calcCotHalfFov(),
    ]);
    device.queue.writeBuffer(
      this.gpuBuffer,
      offsetBytes,
      miscF32Array.buffer,
      0
    );
    offsetBytes += BYTES_VEC4;
  }
}
