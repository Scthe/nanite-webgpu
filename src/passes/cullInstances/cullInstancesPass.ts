import { NaniteObject } from '../../scene/naniteObject.ts';
import { assertIsGPUTextureView } from '../../utils/webgpu.ts';
import {
  BindingsCache,
  assignResourcesToBindings2,
  labelPipeline,
  labelShader,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { SHADER_PARAMS, SHADER_CODE } from './cullInstancesPass.wgsl.ts';

export class CullInstancesPass {
  public static NAME: string = CullInstancesPass.name;

  private readonly pipeline: GPUComputePipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice) {
    const shaderModule = device.createShaderModule({
      label: labelShader(CullInstancesPass),
      code: SHADER_CODE(),
    });

    this.pipeline = device.createComputePipeline({
      label: labelPipeline(CullInstancesPass),
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  onViewportResize = () => {
    this.bindingsCache.clear();
  };

  cmdCullInstances(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;

    // forget draws from previous frame
    naniteObject.buffers.cmdClearDrawnInstancesDispatchParams(cmdBuf);
    naniteObject.buffers.cmdClearDrawnImpostorsParams(cmdBuf);

    const computePass = cmdBuf.beginComputePass({
      label: CullInstancesPass.NAME,
      timestampWrites: profiler?.createScopeGpu(CullInstancesPass.NAME),
    });

    const pipeline = this.pipeline;
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, pipeline, naniteObject)
    );

    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, bindings);

    // dispatch params
    // X: one per instance, but do not overflow limit 65k
    const workgroupsCntX = Math.min(
      naniteObject.instancesCount,
      SHADER_PARAMS.maxWorkgroupsY
    );
    const workgroupsCntY = 1;
    const workgroupsCntZ = 1;

    // dispatch
    // console.log(`${CullInstancesPass.NAME} dispatch(${workgroupsCntX}, ${workgroupsCntY}, ${workgroupsCntZ})`); // prettier-ignore
    computePass.dispatchWorkgroups(
      workgroupsCntX,
      workgroupsCntY,
      workgroupsCntZ
    );

    computePass.end();
  }

  private createBindings = (
    {
      device,
      globalUniforms,
      prevFrameDepthPyramidTexture,
      depthPyramidSampler,
    }: PassCtx,
    pipeline: GPUComputePipeline,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    assertIsGPUTextureView(prevFrameDepthPyramidTexture);

    const buffers = naniteObject.buffers;

    return assignResourcesToBindings2(
      CullInstancesPass,
      naniteObject.name,
      device,
      pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        naniteObject.bindInstanceTransforms(b.instancesTransforms),
        buffers.bindDrawnInstancesParams(b.dispatchIndirectParams),
        buffers.bindDrawnInstancesList(b.drawnInstanceIdsResult),
        buffers.bindDrawnImpostorsParams(b.billboardsParams),
        buffers.bindDrawnImpostorsList(b.billboardsIdsResult),
        {
          binding: b.depthPyramidTexture,
          resource: prevFrameDepthPyramidTexture,
        },
        { binding: b.depthSampler, resource: depthPyramidSampler },
      ]
    );
  };
}
