import { NaniteObject } from '../../scene/naniteObject.ts';
import {
  BindingsCache,
  assignResourcesToBindings2,
  getClearColorVec3,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { DEPTH_FORMAT } from '../../constants.ts';
import { SHADER_CODE, SHADER_PARAMS } from './naniteBillboard.wgsl.ts';
import { bufferBindingDrawnInstanceIdsParams } from '../cullInstances/cullInstancesBuffer.ts';
import { bufferBindingBillboardDrawArray } from './naniteBillboardsBuffer.ts';

// TODO [CRITICAL] on toggling culling reset all buffers that count stuff. ATM disabling culling leaves old billboard data in the buffer
/** Render impostor billboards */
export class NaniteBillboardPass {
  public static NAME: string = NaniteBillboardPass.name;

  private readonly pipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    const shaderModule = device.createShaderModule({
      label: labelShader(NaniteBillboardPass),
      code: SHADER_CODE(),
    });

    this.pipeline = device.createRenderPipeline({
      label: labelPipeline(NaniteBillboardPass),
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: [],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'main_fs',
        targets: [{ format: outTextureFormat }],
      },
      primitive: {
        cullMode: 'none',
        topology: 'triangle-list',
        stripIndexFormat: undefined,
      },
      depthStencil: {
        depthWriteEnabled: true, //  TODO?
        depthCompare: 'less',
        format: DEPTH_FORMAT,
      },
    });
  }

  cmdRenderBillboards(
    ctx: PassCtx,
    naniteObject: NaniteObject,
    loadOp: GPULoadOp
  ) {
    const { cmdBuf, profiler, depthTexture, screenTexture } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: NaniteBillboardPass.NAME,
      colorAttachments: [
        useColorAttachment(screenTexture, getClearColorVec3(), loadOp),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture, loadOp),
      timestampWrites: profiler?.createScopeGpu(NaniteBillboardPass.NAME),
    });
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, naniteObject)
    );

    // set render pass data
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, bindings);

    // draw
    renderPass.drawIndirect(naniteObject.billboardImpostorsBuffer, 0);

    // fin
    renderPass.end();
  }

  private createBindings = (
    { device, globalUniforms, scene }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    const drawnInstanceIdsBuffer = naniteObject.drawnInstanceIdsBuffer;
    const billboardImpostorsBuffer = naniteObject.billboardImpostorsBuffer;

    return assignResourcesToBindings2(
      NaniteBillboardPass,
      naniteObject.name,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        naniteObject.bufferBindingInstanceTransforms(b.instancesTransforms),
        bufferBindingDrawnInstanceIdsParams(
          drawnInstanceIdsBuffer,
          b.wholeObjectCullData
        ),
        bufferBindingBillboardDrawArray(
          billboardImpostorsBuffer,
          b.billboardsIdsResult
        ),
        naniteObject.impostor.bind(b.impostorTexture),
        // needs nearest as we will also sample packed normals
        { binding: b.sampler, resource: scene.samplerNearest },
      ]
    );
  };
}
