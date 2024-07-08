import { assertIsGPUTextureView } from '../../utils/webgpu.ts';
import {
  labelShader,
  labelPipeline,
  assignResourcesToBindings2,
  BindingsCache,
  useColorAttachment,
  getClearColorVec3,
  PIPELINE_DEPTH_STENCIL_ON,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { SHADER_PARAMS, SHADER_CODE } from './rasterizeCombine.wgsl.ts';
import { PassCtx } from '../passCtx.ts';
import { cmdDrawFullscreenTriangle } from '../_shaderSnippets/fullscreenTriangle.wgsl.ts';

export class RasterizeCombine {
  public static NAME: string = RasterizeCombine.name;

  private readonly pipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    const shaderModule = device.createShaderModule({
      label: labelShader(RasterizeCombine),
      code: SHADER_CODE(),
    });

    this.pipeline = device.createRenderPipeline({
      label: labelPipeline(RasterizeCombine),
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: [],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'main_fs',
        targets: [
          {
            format: outTextureFormat,
            blend: {
              color: {
                srcFactor: 'src-alpha',
                dstFactor: 'one-minus-src-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: { topology: 'triangle-list' },
      depthStencil: PIPELINE_DEPTH_STENCIL_ON,
    });
  }

  onViewportResize = () => this.bindingsCache.clear();

  cmdCombineRasterResults(ctx: PassCtx) {
    const {
      cmdBuf,
      profiler,
      hdrRenderTexture,
      rasterizerSwResult,
      depthTexture,
    } = ctx;
    assertIsGPUTextureView(hdrRenderTexture);

    const renderPass = cmdBuf.beginRenderPass({
      label: RasterizeCombine.NAME,
      colorAttachments: [
        // do not clear!
        useColorAttachment(hdrRenderTexture, getClearColorVec3(), 'load'),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture, 'load'),
      timestampWrites: profiler?.createScopeGpu(RasterizeCombine.NAME),
    });

    const bindings = this.bindingsCache.getBindings(depthTexture.label, () =>
      this.createBindings(ctx, rasterizerSwResult)
    );
    renderPass.setBindGroup(0, bindings);
    renderPass.setPipeline(this.pipeline);
    cmdDrawFullscreenTriangle(renderPass);
    renderPass.end();
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    rasterizerSwResult: GPUBuffer
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

    return assignResourcesToBindings2(
      RasterizeCombine,
      RasterizeCombine.NAME,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        {
          binding: b.softwareRasterizerResult,
          resource: { buffer: rasterizerSwResult },
        },
      ]
    );
  };
}
