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
import { STATS } from '../../sys_web/stats.ts';
import { SHADER_PARAMS, SHADER_CODE } from './naniteVisibilityPass.wgsl.ts';
import { CONFIG } from '../../constants.ts';
import {
  bufferBindingDrawnInstanceIdsParams,
  bufferBindingDrawnInstanceIdsArray,
} from '../../scene/naniteBuffers/drawnInstancesBuffer.ts';

/** Pass to cull on meshlet level */
export class NaniteVisibilityPass {
  public static NAME: string = NaniteVisibilityPass.name;

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
      label: labelShader(NaniteVisibilityPass),
      code: SHADER_CODE(),
    });

    this.pipeline_SpreadYZ = NaniteVisibilityPass.createPipeline(
      device,
      shaderModule,
      'main_SpreadYZ'
    );
    this.pipeline_Iter = NaniteVisibilityPass.createPipeline(
      device,
      shaderModule,
      'main_Iter'
    );
    this.pipeline_Indirect = NaniteVisibilityPass.createPipeline(
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
      label: labelPipeline(NaniteVisibilityPass, mainFn),
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

  cmdCalculateVisibility(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;

    // forget draws from previous frame
    naniteObject.cmdClearDrawParams(cmdBuf);

    const computePass = cmdBuf.beginComputePass({
      timestampWrites: profiler?.createScopeGpu(NaniteVisibilityPass.NAME),
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
    STATS.update('Visibility wkgrp',`[${workgroupsCntX}, ${workgroupsCntY}, ${workgroupsCntZ}]`); // prettier-ignore
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
    STATS.update('Visibility wkgrp',`[${workgroupsCntX}, ${workgroupsCntY}, ${workgroupsCntZ}]`); // prettier-ignore
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
      naniteObject.drawnInstanceIdsBuffer,
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
    assertIsGPUTextureView(prevFrameDepthPyramidTexture);

    return [
      globalUniforms.createBindingDesc(b.renderUniforms),
      naniteObject.bufferBindingMeshlets(b.meshlets),
      naniteObject.bufferBindingVisibility(b.drawnMeshletIds),
      naniteObject.bufferBindingIndirectDrawParams(b.drawIndirectParams),
      naniteObject.bufferBindingInstanceTransforms(b.instancesTransforms),
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
      NaniteVisibilityPass,
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
    const drawnInstanceIdsBuffer = naniteObject.drawnInstanceIdsBuffer;

    return assignResourcesToBindings2(
      NaniteVisibilityPass,
      naniteObject.name,
      device,
      pipeline,
      [
        ...bindGroups,
        bufferBindingDrawnInstanceIdsParams(
          drawnInstanceIdsBuffer,
          b.indirectDispatchIndirectParams
        ),
        bufferBindingDrawnInstanceIdsArray(
          drawnInstanceIdsBuffer,
          b.indirectDrawnInstanceIdsResult
        ),
      ]
    );
  };
}
