import { NaniteObject } from '../../scene/naniteObject.ts';
import {
  assertIsGPUTextureView,
  getItemsPerThread,
} from '../../utils/webgpu.ts';
import {
  BindingsCache,
  assignResourcesToBindings2,
  labelPipeline,
  labelShader,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { SHADER_PARAMS, SHADER_CODE } from './cullMeshletsPass.wgsl.ts';
import { CONFIG } from '../../constants.ts';

/** Pass to cull on meshlet level */
export class CullMeshletsPass {
  public static NAME: string = 'CullMeshletsPass';

  // shader variant 1
  private readonly pipeline_SpreadYZ: GPUComputePipeline;
  private readonly bindingsCache_SpreadYZ = new BindingsCache();

  // shader variant 2
  private readonly pipeline_Iter: GPUComputePipeline;
  private readonly bindingsCache_Iter = new BindingsCache();

  // shader variant 3
  private readonly pipeline_Indirect: GPUComputePipeline;
  private readonly bindingsCache_Indirect = new BindingsCache();

  constructor(device: GPUDevice) {
    const shaderModule = device.createShaderModule({
      label: labelShader(CullMeshletsPass),
      code: SHADER_CODE(),
    });

    this.pipeline_SpreadYZ = CullMeshletsPass.createPipeline(
      device,
      shaderModule,
      'main_SpreadYZ'
    );
    this.pipeline_Iter = CullMeshletsPass.createPipeline(
      device,
      shaderModule,
      'main_Iter'
    );
    this.pipeline_Indirect = CullMeshletsPass.createPipeline(
      device,
      shaderModule,
      'main_Indirect'
    );
  }

  private static createPipeline(
    device: GPUDevice,
    shaderModule: GPUShaderModule,
    mainFn: string
  ) {
    return device.createComputePipeline({
      label: labelPipeline(CullMeshletsPass, mainFn),
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: mainFn,
      },
    });
  }

  onViewportResize = () => {
    this.bindingsCache_SpreadYZ.clear();
    this.bindingsCache_Iter.clear();
    this.bindingsCache_Indirect.clear();
  };

  cmdCullMeshlets(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;

    // forget draws from previous frame
    naniteObject.buffers.cmdClearDrawnMeshletsParams(cmdBuf);

    const computePass = cmdBuf.beginComputePass({
      label: CullMeshletsPass.NAME,
      timestampWrites: profiler?.createScopeGpu(CullMeshletsPass.NAME),
    });

    if (CONFIG.cullingInstances.enabled) {
      this.dispatchVariant_Indirect(ctx, computePass, naniteObject);
    } else if (CONFIG.nanite.render.useVisibilityImpl_Iter) {
      this.dispatchVariant_Iter(ctx, computePass, naniteObject);
    } else {
      this.dispatchVariant_SpreadYZ(ctx, computePass, naniteObject);
    }

    computePass.end();
  }

  /** See shader for explanation */
  private dispatchVariant_SpreadYZ(
    ctx: PassCtx,
    computePass: GPUComputePassEncoder,
    naniteObject: NaniteObject
  ) {
    const pipeline = this.pipeline_SpreadYZ;
    const bindings = this.bindingsCache_SpreadYZ.getBindings(
      naniteObject.name,
      () => this.createBindings(ctx, pipeline, naniteObject)
    );

    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, bindings);

    // dispatch params
    // X: one per meshlet
    const workgroupsCntX = getItemsPerThread(
      naniteObject.meshletCount,
      SHADER_PARAMS.workgroupSizeX
    );
    // Y,Z: There is max of 65k for this number. We might have > 65k instances.
    // So we split the instance count between y, z.
    const workgroupsCntY = Math.ceil(
      Math.min(naniteObject.instancesCount, SHADER_PARAMS.maxWorkgroupsY)
    );
    const workgroupsCntZ = Math.ceil(
      naniteObject.instancesCount / SHADER_PARAMS.maxWorkgroupsY
    );

    // dispatch
    computePass.dispatchWorkgroups(
      workgroupsCntX,
      workgroupsCntY,
      workgroupsCntZ
    );
  }

  /** See shader for explanation */
  private dispatchVariant_Iter(
    ctx: PassCtx,
    computePass: GPUComputePassEncoder,
    naniteObject: NaniteObject
  ) {
    const pipeline = this.pipeline_Iter;
    const bindings = this.bindingsCache_Iter.getBindings(
      naniteObject.name,
      () => this.createBindings(ctx, pipeline, naniteObject)
    );

    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, bindings);

    // dispatch params
    // X: one per meshlet
    const workgroupsCntX = getItemsPerThread(
      naniteObject.meshletCount,
      SHADER_PARAMS.workgroupSizeX
    );
    // Y: one per instance, but do not overflow limit 65k
    const workgroupsCntY = Math.min(
      naniteObject.instancesCount,
      SHADER_PARAMS.maxWorkgroupsY
    );
    // Z: nope
    const workgroupsCntZ = 1;

    // dispatch
    computePass.dispatchWorkgroups(
      workgroupsCntX,
      workgroupsCntY,
      workgroupsCntZ
    );
  }

  /** See shader for explanation */
  private dispatchVariant_Indirect(
    ctx: PassCtx,
    computePass: GPUComputePassEncoder,
    naniteObject: NaniteObject
  ) {
    const pipeline = this.pipeline_Indirect;
    const bindings = this.bindingsCache_Indirect.getBindings(
      naniteObject.name,
      () => this.createBindingsIndirect(ctx, pipeline, naniteObject)
    );

    computePass.setPipeline(pipeline);
    computePass.setBindGroup(0, bindings);

    // dispatch
    computePass.dispatchWorkgroupsIndirect(
      naniteObject.buffers.drawnInstancesBuffer,
      0
    );
  }

  /** Shared by both normal and indirect variants */
  private getTheUsuallBindGroups(
    {
      globalUniforms,
      prevFrameDepthPyramidTexture,
      depthPyramidSampler,
    }: PassCtx,
    naniteObject: NaniteObject
  ) {
    const b = SHADER_PARAMS.bindings;
    const buffers = naniteObject.buffers;
    assertIsGPUTextureView(prevFrameDepthPyramidTexture);

    return [
      globalUniforms.createBindingDesc(b.renderUniforms),
      buffers.bindMeshletData(b.meshletsData),
      buffers.bindDrawnMeshletsParams(b.drawnMeshletsParams),
      buffers.bindDrawnMeshletsList(b.drawnMeshletsList),
      buffers.bindDrawnMeshletsSwParams(b.drawnMeshletsSwParams),
      naniteObject.bindInstanceTransforms(b.instancesTransforms),
      {
        binding: b.depthPyramidTexture,
        resource: prevFrameDepthPyramidTexture,
      },
      { binding: b.depthSampler, resource: depthPyramidSampler },
    ];
  }

  private createBindings = (
    ctx: PassCtx,
    pipeline: GPUComputePipeline,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const { device } = ctx;
    const bindGroups = this.getTheUsuallBindGroups(ctx, naniteObject);

    return assignResourcesToBindings2(
      CullMeshletsPass,
      naniteObject.name,
      device,
      pipeline,
      bindGroups
    );
  };

  private createBindingsIndirect = (
    ctx: PassCtx,
    pipeline: GPUComputePipeline,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const { device } = ctx;
    const b = SHADER_PARAMS.bindings;
    const bindGroups = this.getTheUsuallBindGroups(ctx, naniteObject);

    const buffers = naniteObject.buffers;

    return assignResourcesToBindings2(
      CullMeshletsPass,
      naniteObject.name,
      device,
      pipeline,
      [
        ...bindGroups,
        buffers.bindDrawnInstancesParams(b.drawnInstancesParams),
        buffers.bindDrawnInstancesList(b.drawnInstancesList),
      ]
    );
  };
}
