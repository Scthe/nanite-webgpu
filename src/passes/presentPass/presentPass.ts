import { assertIsGPUTextureView } from '../../utils/webgpu.ts';
import {
  labelShader,
  labelPipeline,
  assignResourcesToBindings2,
  BindingsCache,
  getClearColorVec3,
  useColorAttachment,
} from '../_shared.ts';
import { SHADER_PARAMS, SHADER_CODE } from './presentPass.wgsl.ts';
import { PassCtx } from '../passCtx.ts';
import { cmdDrawFullscreenTriangle } from '../_shaderSnippets/fullscreenTriangle.wgsl.ts';

export class PresentPass {
  public static NAME: string = 'PresentPass';

  private readonly renderPipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    const shaderModule = device.createShaderModule({
      label: labelShader(PresentPass),
      code: SHADER_CODE(),
    });

    this.renderPipeline = device.createRenderPipeline({
      label: labelPipeline(PresentPass),
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
      primitive: { topology: 'triangle-list' },
    });
  }

  onViewportResize = () => this.bindingsCache.clear();

  cmdDraw(ctx: PassCtx, screenTexture: GPUTextureView) {
    const { cmdBuf, profiler, depthTexture } = ctx;
    assertIsGPUTextureView(screenTexture);

    const renderPass = cmdBuf.beginRenderPass({
      label: PresentPass.NAME,
      colorAttachments: [
        // TBH no need for clear as we override every pixel
        useColorAttachment(screenTexture, getClearColorVec3()),
      ],
      timestampWrites: profiler?.createScopeGpu(PresentPass.NAME),
    });

    const bindings = this.bindingsCache.getBindings(depthTexture.label, () =>
      this.createBindings(ctx)
    );
    renderPass.setBindGroup(0, bindings);
    renderPass.setPipeline(this.renderPipeline);
    cmdDrawFullscreenTriangle(renderPass);
    renderPass.end();
  }

  private createBindings = ({
    device,
    globalUniforms,
    hdrRenderTexture,
  }: PassCtx): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

    return assignResourcesToBindings2(
      PresentPass,
      '000',
      device,
      this.renderPipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        { binding: b.textureSrc, resource: hdrRenderTexture },
      ]
    );
  };
}
