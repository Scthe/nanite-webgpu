import { BYTES_U32 } from '../../constants.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import { Dimensions, ensureTypedArray } from '../../utils/index.ts';
import { createGPU_StorageBuffer } from '../../utils/webgpu.ts';
import {
  labelShader,
  labelPipeline,
  assignResourcesToBindings2,
  BindingsCache,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { SHADER_CODE, SHADER_PARAMS } from './rasterizeSwPass.wgsl.ts';

export class RasterizeSwPass {
  public static NAME: string = RasterizeSwPass.name;

  private readonly pipeline: GPUComputePipeline;
  private readonly bindingsCache = new BindingsCache();

  /** result framebuffer as flat buffer */
  public resultBuffer: GPUBuffer = undefined!; // see this.handleViewportResize()
  private readonly MOCK_vertexPositionsBuffer: GPUBuffer;
  private readonly MOCK_indexBuffer: GPUBuffer;

  constructor(device: GPUDevice) {
    const shaderModule = device.createShaderModule({
      label: labelShader(RasterizeSwPass),
      code: SHADER_CODE(),
    });
    this.pipeline = device.createComputePipeline({
      label: labelPipeline(RasterizeSwPass),
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });

    //////// MOCKS
    const VERTEX_POSITIONS = [
      [0, 0.2, 0.0, 1.0],
      [0.25, -0.2, 0.0, 1.0], // remember: CCW vs CW (ALWAYS USE CW)
      [-0.25, -0.2, 0.0, 1.0],
    ].flat();
    const INDEX_BUFFER = [0, 1, 2];
    const OBJ_NAME = 'RasterizeSwPass-obj';
    this.MOCK_vertexPositionsBuffer = createGPU_StorageBuffer(
      device,
      `${OBJ_NAME}-vertices`,
      ensureTypedArray(Float32Array, VERTEX_POSITIONS)
    );
    this.MOCK_indexBuffer = createGPU_StorageBuffer(
      device,
      `${OBJ_NAME}-indices`,
      ensureTypedArray(Uint32Array, INDEX_BUFFER)
    );
  }

  /** Clears to 0. We cannot select a number */
  clearFramebuffer(ctx: PassCtx) {
    ctx.cmdBuf.clearBuffer(this.resultBuffer);
  }

  onViewportResize = (device: GPUDevice, viewportSize: Dimensions) => {
    this.bindingsCache.clear();

    if (this.resultBuffer) {
      this.resultBuffer.destroy();
    }

    this.resultBuffer = device.createBuffer({
      label: `rasterize-sw`,
      size: BYTES_U32 * viewportSize.width * viewportSize.height,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.INDIRECT |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC, // for stats, debug etc.
    });
  };

  cmdSoftwareRasterize(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;

    // no need to clear previous values, as we override every pixel
    const computePass = cmdBuf.beginComputePass({
      label: RasterizeSwPass.NAME,
      timestampWrites: profiler?.createScopeGpu(RasterizeSwPass.NAME),
    });

    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, this.resultBuffer, naniteObject)
    );
    computePass.setPipeline(this.pipeline);
    computePass.setBindGroup(0, bindings);

    // dispatch
    /*computePass.dispatchWorkgroupsIndirect(
      naniteObject.buffers.drawnMeshletsSwBuffer,
      0
    );*/
    const triangleCount = 1;
    computePass.dispatchWorkgroups(triangleCount, 1, 1);

    computePass.end();
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    resultBuffer: GPUBuffer,
    _naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    // const buffers = naniteObject.buffers;

    return assignResourcesToBindings2(
      RasterizeSwPass,
      'test', // naniteObject.name,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        { binding: b.resultBuffer, resource: { buffer: resultBuffer } },
        // buffers.bindVertexPositions(b.vertexPositions),
        // buffers.bindIndexBuffer(b.indexBuffer),
        {
          binding: b.vertexPositions,
          resource: { buffer: this.MOCK_vertexPositionsBuffer },
        },
        {
          binding: b.indexBuffer,
          resource: { buffer: this.MOCK_indexBuffer },
        },
      ]
    );
  };
}
