import { BYTES_U32 } from '../../constants.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import { Dimensions } from '../../utils/index.ts';
import {
  labelShader,
  labelPipeline,
  assignResourcesToBindings2,
  BindingsCache,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { SHADER_CODE, SHADER_PARAMS } from './rasterizeSwPass.wgsl.ts';

export class RasterizeSwPass {
  public static NAME: string = 'RasterizeSwPass';

  private readonly pipeline: GPUComputePipeline;
  private readonly bindingsCache = new BindingsCache();

  /** result framebuffer as flat buffer */
  public resultBuffer: GPUBuffer = undefined!; // see this.handleViewportResize()

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
    naniteObject.buffers.cmdDrawMeshletsSoftwareIndirect(computePass);

    computePass.end();
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    resultBuffer: GPUBuffer,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    const buffers = naniteObject.buffers;

    return assignResourcesToBindings2(
      RasterizeSwPass,
      naniteObject.name,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        { binding: b.resultBuffer, resource: { buffer: resultBuffer } },
        buffers.bindVertexPositions(b.vertexPositions),
        buffers.bindVertexNormals(b.vertexNormals),
        buffers.bindIndexBuffer(b.indexBuffer),
        buffers.bindMeshletData(b.meshletsData),
        buffers.bindDrawnMeshletsList(b.drawnMeshletIds),
        buffers.bindDrawnMeshletsSwParams(b.drawnMeshletParams),
        naniteObject.bindInstanceTransforms(b.instancesTransforms),
      ]
    );
  };
}
