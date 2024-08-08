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

/** Render impostor billboards */
export class NaniteBillboardPass {
  public static NAME: string = 'NaniteBillboardPass';

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
        depthWriteEnabled: true,
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
    const { cmdBuf, profiler, depthTexture, hdrRenderTexture } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: NaniteBillboardPass.NAME,
      colorAttachments: [
        useColorAttachment(hdrRenderTexture, getClearColorVec3(), loadOp),
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
    renderPass.drawIndirect(naniteObject.buffers.drawnImpostorsBuffer, 0);

    // fin
    renderPass.end();
  }

  private createBindings = (
    { device, globalUniforms, scene }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    const buffers = naniteObject.buffers;

    return assignResourcesToBindings2(
      NaniteBillboardPass,
      naniteObject.name,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        naniteObject.bindInstanceTransforms(b.instancesTransforms),
        buffers.bindDrawnInstancesParams(b.wholeObjectCullData),
        buffers.bindDrawnImpostorsList(b.billboardsIdsResult),
        naniteObject.impostor.bind(b.impostorTexture),
        // needs nearest as we will also sample packed normals
        { binding: b.sampler, resource: scene.samplerNearest },
      ]
    );
  };
}
