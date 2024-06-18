import { NaniteObject } from '../../scene/naniteObject.ts';
import { getItemsPerThread } from '../../utils/webgpu.ts';
import {
  BindingsCache,
  assignResourcesToBindings2,
  labelPipeline,
  labelShader,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { STATS } from '../../sys_web/stats.ts';
import { SHADER_PARAMS, SHADER_CODE } from './naniteVisibilityPass.wgsl.ts';

export class NaniteVisibilityPass {
  public static NAME: string = NaniteVisibilityPass.name;

  private readonly pipeline: GPUComputePipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice) {
    this.pipeline = NaniteVisibilityPass.createPipeline(device);
  }

  private static createPipeline(device: GPUDevice) {
    const shaderModule = device.createShaderModule({
      label: labelShader(NaniteVisibilityPass),
      code: SHADER_CODE(),
    });
    return device.createComputePipeline({
      label: labelPipeline(NaniteVisibilityPass),
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  cmdCalculateVisibility(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, naniteObject)
    );

    naniteObject.cmdClearDrawParams(cmdBuf);

    const computePass = cmdBuf.beginComputePass({
      timestampWrites: profiler?.createScopeGpu(NaniteVisibilityPass.NAME),
    });
    computePass.setPipeline(this.pipeline);
    computePass.setBindGroup(0, bindings);

    // dispatch
    const workgroupsCntX = getItemsPerThread(
      naniteObject.meshletCount,
      SHADER_PARAMS.workgroupSizeX
    );
    const workgroupsCntY = Math.min(
      naniteObject.instancesCount,
      SHADER_PARAMS.maxWorkgroupsY
    );
    computePass.dispatchWorkgroups(workgroupsCntX, workgroupsCntY);
    STATS.update('Visibility wkgrp',`[${workgroupsCntX}, ${workgroupsCntY}, 1]`); // prettier-ignore

    computePass.end();
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

    return assignResourcesToBindings2(
      NaniteVisibilityPass,
      naniteObject.name,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        naniteObject.bufferBindingMeshlets(b.meshlets),
        naniteObject.bufferBindingVisibility(b.drawnMeshletIds),
        naniteObject.bufferBindingIndirectDrawParams(b.drawIndirectParams),
        naniteObject.bufferBindingInstanceTransforms(b.instancesTransforms),
      ]
    );
  };
}
