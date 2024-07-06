import { NaniteObject } from '../../scene/naniteObject.ts';
import { getItemsPerThread } from '../../utils/webgpu.ts';
import {
  labelShader,
  labelPipeline,
  assignResourcesToBindings2,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { SHADER_CODE, SHADER_PARAMS } from './rasterizeSwPass.wgsl.ts';

export class RasterizeSwPass {
  public static NAME: string = RasterizeSwPass.name;

  private readonly pipeline: GPUComputePipeline;

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

  // TODO [CRITICAL] handle resize
  onViewportResize = () => {};

  cmdRasterizeInSoftware(
    ctx: PassCtx,
    resultBuffer: GPUBuffer,
    naniteObject: NaniteObject
  ) {
    const { cmdBuf, profiler, viewport } = ctx;

    // no need to clear previous values, as we override every pixel
    const computePass = cmdBuf.beginComputePass({
      timestampWrites: profiler?.createScopeGpu(RasterizeSwPass.NAME),
    });

    const bindings = this.createBindings(ctx, resultBuffer, naniteObject);
    computePass.setPipeline(this.pipeline);
    computePass.setBindGroup(0, bindings);

    /*
    // dispatch params
    const workgroupsCntX = getItemsPerThread(
      viewport.width,
      SHADER_PARAMS.workgroupSizeX
    );
    const workgroupsCntY = getItemsPerThread(
      viewport.height,
      SHADER_PARAMS.workgroupSizeY
    );

    // dispatch
    computePass.dispatchWorkgroups(workgroupsCntX, workgroupsCntY, 1);
    // console.log(`${RasterizeWsPass.NAME}.dispatch [${workgroupsCntX}, ${workgroupsCntY}, 1]`); // prettier-ignore
    */
    const triangleCount = 1;
    computePass.dispatchWorkgroups(triangleCount, 1, 1);

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
        buffers.bindIndexBuffer(b.indexBuffer),
      ]
    );
  };
}
