import { Mat4 } from 'wgpu-matrix';
import { BYTES_F32, BYTES_MAT4, BYTES_VEC4, CONFIG } from '../constants.ts';
import { GPU_BUFFER_USAGE_UNIFORM } from '../utils/webgpu.ts';
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
  private readonly data = new ArrayBuffer(RenderUniformsBuffer.BUFFER_SIZE);
  private readonly dataAsF32: Float32Array;

  constructor(device: GPUDevice) {
    this.gpuBuffer = device.createBuffer({
      label: 'render-uniforms-buffer',
      size: RenderUniformsBuffer.BUFFER_SIZE,
      usage: GPU_BUFFER_USAGE_UNIFORM,
    });
    this.dataAsF32 = new Float32Array(this.data);
  }

  createBindingDesc = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.gpuBuffer },
  });

  update(ctx: PassCtx) {
    const { device, vpMatrix, viewMatrix, projMatrix, viewport } = ctx;

    let offsetBytes = 0;
    offsetBytes = this.writeMat4(offsetBytes, vpMatrix);
    offsetBytes = this.writeMat4(offsetBytes, viewMatrix);
    offsetBytes = this.writeMat4(offsetBytes, projMatrix);
    offsetBytes = this.writeF32(offsetBytes, viewport.width);
    offsetBytes = this.writeF32(offsetBytes, viewport.height);
    offsetBytes = this.writeF32(offsetBytes, CONFIG.nanite.render.pixelThreshold); // prettier-ignore
    offsetBytes = this.writeF32(offsetBytes, calcCotHalfFov());
    device.queue.writeBuffer(this.gpuBuffer, 0, this.data, 0, offsetBytes);
  }

  private writeMat4(offsetBytes: number, mat: Mat4) {
    const offset = offsetBytes / BYTES_F32;
    for (let i = 0; i < 16; i++) {
      this.dataAsF32[offset + i] = mat[i];
    }
    return offsetBytes + BYTES_MAT4;
  }

  private writeF32(offsetBytes: number, v: number) {
    const offset = offsetBytes / BYTES_F32;
    this.dataAsF32[offset] = v;
    return offsetBytes + BYTES_F32;
  }
}
