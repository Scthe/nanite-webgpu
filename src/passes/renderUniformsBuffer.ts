import { Mat4 } from 'wgpu-matrix';
import {
  BYTES_F32,
  BYTES_MAT4,
  BYTES_U32,
  BYTES_VEC4,
  CONFIG,
} from '../constants.ts';
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
      cameraFrustumPlane0: vec4f, // TODO there are much more efficient ways for frustum culling
      cameraFrustumPlane1: vec4f, // https://github.com/zeux/niagara/blob/master/src/shaders/drawcull.comp.glsl#L72
      cameraFrustumPlane2: vec4f,
      cameraFrustumPlane3: vec4f,
      cameraFrustumPlane4: vec4f,
      cameraFrustumPlane5: vec4f,
      flags: u32,
      padding0: u32,
      padding1: u32,
      padding2: u32,
    };
    @binding(0) @group(${group})
    var<uniform> _uniforms: Uniforms;
  `;

  public static BUFFER_SIZE =
    BYTES_MAT4 + // vpMatrix
    BYTES_MAT4 + // viewMatrix
    BYTES_MAT4 + // projMatrix
    BYTES_VEC4 + // viewport
    6 * BYTES_VEC4 + // camera frustum planes
    4 * BYTES_U32; // flags + padding

  private readonly gpuBuffer: GPUBuffer;
  private readonly data = new ArrayBuffer(RenderUniformsBuffer.BUFFER_SIZE);
  private readonly dataAsF32: Float32Array;
  private readonly dataAsU32: Uint32Array;

  constructor(device: GPUDevice) {
    this.gpuBuffer = device.createBuffer({
      label: 'render-uniforms-buffer',
      size: RenderUniformsBuffer.BUFFER_SIZE,
      usage: GPU_BUFFER_USAGE_UNIFORM,
    });
    this.dataAsF32 = new Float32Array(this.data);
    this.dataAsU32 = new Uint32Array(this.data);
  }

  createBindingDesc = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.gpuBuffer },
  });

  update(ctx: PassCtx) {
    const {
      device,
      vpMatrix,
      viewMatrix,
      projMatrix,
      viewport,
      cameraFrustum,
    } = ctx;

    let offsetBytes = 0;
    offsetBytes = this.writeMat4(offsetBytes, vpMatrix);
    offsetBytes = this.writeMat4(offsetBytes, viewMatrix);
    offsetBytes = this.writeMat4(offsetBytes, projMatrix);
    // viewport
    offsetBytes = this.writeF32(offsetBytes, viewport.width);
    offsetBytes = this.writeF32(offsetBytes, viewport.height);
    offsetBytes = this.writeF32(offsetBytes, CONFIG.nanite.render.pixelThreshold); // prettier-ignore
    offsetBytes = this.writeF32(offsetBytes, calcCotHalfFov());
    // camera frustum planes
    for (let i = 0; i < cameraFrustum.planes.length; i++) {
      offsetBytes = this.writeF32(offsetBytes, cameraFrustum.planes[i]);
    }
    // misc
    offsetBytes = this.writeU32(
      offsetBytes,
      CONFIG.nanite.render.useFrustumCulling ? 1 : 0
    );
    // padding
    offsetBytes += 3 * BYTES_U32;

    // final write
    if (offsetBytes !== RenderUniformsBuffer.BUFFER_SIZE) {
      throw new Error(`Invalid write to RenderUniformsBuffer. Buffer has ${RenderUniformsBuffer.BUFFER_SIZE}bytes, but tried to write ${offsetBytes} bytes.`); // prettier-ignore
    }
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

  private writeU32(offsetBytes: number, v: number) {
    const offset = offsetBytes / BYTES_U32;
    this.dataAsU32[offset] = Math.floor(v);
    return offsetBytes + BYTES_U32;
  }
}
