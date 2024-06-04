import { BYTES_MAT4, BYTES_VEC4 } from '../constants.ts';
import {
  GPU_BUFFER_USAGE_UNIFORM,
  writeMatrixToGPUBuffer,
} from '../utils/index.ts';
import { PassCtx } from './passCtx.ts';

/** Example: https://webgpu.github.io/webgpu-samples/?sample=cameras#cube.wgsl */
export class RenderUniformsBuffer {
  public static BUFFER_SIZE =
    BYTES_MAT4 + // mvpMatrix
    BYTES_MAT4 + // viewMatrix
    BYTES_VEC4; // viewportAndFocals

  private readonly gpuBuffer: GPUBuffer;

  constructor(device: GPUDevice) {
    this.gpuBuffer = device.createBuffer({
      label: 'GlobalUniformBuffer',
      size: RenderUniformsBuffer.BUFFER_SIZE,
      usage: GPU_BUFFER_USAGE_UNIFORM,
    });
  }

  createBindingDesc = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.gpuBuffer },
  });

  update(ctx: PassCtx) {
    const { device, mvpMatrix, viewMatrix, viewport } = ctx;
    let offsetBytes = 0;

    // TODO single write to GPU instead many tiny ones
    writeMatrixToGPUBuffer(device, this.gpuBuffer, offsetBytes, mvpMatrix);
    offsetBytes += BYTES_MAT4;

    writeMatrixToGPUBuffer(device, this.gpuBuffer, offsetBytes, viewMatrix);
    offsetBytes += BYTES_MAT4;

    // scale as vec4
    const miscF32Array = new Float32Array([
      viewport.width,
      viewport.height,
      0,
      0,
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
