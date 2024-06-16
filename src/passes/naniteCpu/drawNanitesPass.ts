import { BYTES_VEC3, CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';
import {
  BindingsCache,
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assertHasShaderCode,
  assignResourcesToBindings2,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import {
  calcCotHalfFov,
  calcNaniteMeshletsVisibility,
} from './calcNaniteMeshletsVisibility.ts';
import { NaniteObject, getPreNaniteStats } from '../../scene/naniteObject.ts';
import { STATS } from '../../sys_web/stats.ts';
import { formatNumber } from '../../utils/index.ts';
import { applyShaderTextReplace } from '../../utils/webgpu.ts';

const BINDINGS_RENDER_UNIFORMS = 0;
const BINDINGS_INSTANCES_TRANSFORMS = 1;

export const VERTEX_ATTRIBUTES: GPUVertexBufferLayout[] = [
  {
    attributes: [
      {
        shaderLocation: 0, // position
        offset: 0,
        format: 'float32x3',
      },
    ],
    arrayStride: BYTES_VEC3,
    stepMode: 'vertex',
  },
];

export class DrawNanitesPass {
  public static NAME: string = DrawNanitesPass.name;
  public static SHADER_CODE: string;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    assertHasShaderCode(DrawNanitesPass);
    this.renderPipeline = DrawNanitesPass.createRenderPipeline(
      device,
      outTextureFormat
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    let code = `
${RenderUniformsBuffer.SHADER_SNIPPET(BINDINGS_RENDER_UNIFORMS)}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_CHECK_IS_CULLED}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${DrawNanitesPass.SHADER_CODE}
      `;
    code = applyShaderTextReplace(code, {
      __BINDINGS_INSTANCES_TRANSFORMS: String(BINDINGS_INSTANCES_TRANSFORMS),
    });

    const shaderModule = device.createShaderModule({
      label: labelShader(DrawNanitesPass),
      code,
    });
    return device.createRenderPipeline({
      label: labelPipeline(DrawNanitesPass),
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: VERTEX_ATTRIBUTES,
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'main_fs',
        targets: [{ format: outTextureFormat }],
      },
      primitive: PIPELINE_PRIMITIVE_TRIANGLE_LIST,
      depthStencil: PIPELINE_DEPTH_STENCIL_ON,
    });
  }

  draw(ctx: PassCtx) {
    const { cmdBuf, profiler, depthTexture, screenTexture } = ctx;

    // in this fn, time taken is on CPU, as GPU is async. Not 100% accurate, but good enough?
    const visibilityCheckProfiler = profiler?.startRegionCpu('VisibilityCheckCPU'); // prettier-ignore

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DrawNanitesPass.NAME,
      colorAttachments: [useColorAttachment(screenTexture, CONFIG.clearColor)],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DrawNanitesPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);

    // draw
    this.renderNaniteObject(ctx, renderPass, ctx.scene.naniteObject);

    // fin
    profiler?.endRegionCpu(visibilityCheckProfiler);
    renderPass.end();
  }

  private renderNaniteObject(
    ctx: PassCtx,
    renderPass: GPURenderPassEncoder,
    naniteObject: NaniteObject
  ) {
    const instances = naniteObject.instances.transforms;
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, naniteObject)
    );

    renderPass.setBindGroup(0, bindings);
    renderPass.setVertexBuffer(0, naniteObject.vertexBuffer);
    renderPass.setIndexBuffer(naniteObject.indexBuffer, 'uint32');

    let drawnTriangleCount = 0;
    let drawnMeshletsCount = 0;
    const cotHalfFov = calcCotHalfFov(); // ~2.414213562373095,

    for (let instanceIdx = 0; instanceIdx < instances.length; instanceIdx++) {
      const instanceModelMat = instances[instanceIdx];
      const toDrawCount = calcNaniteMeshletsVisibility(
        ctx,
        cotHalfFov,
        instanceModelMat,
        naniteObject
      );
      drawnMeshletsCount += toDrawCount;

      for (let mIdx = 0; mIdx < toDrawCount; mIdx++) {
        const m = naniteObject.naniteVisibilityBufferCPU.drawnMeshlets[mIdx];
        const triangleCount = m.triangleCount;
        const vertexCount = triangleCount * VERTS_IN_TRIANGLE;
        renderPass.drawIndexed(
          vertexCount,
          1, // instance count
          m.firstIndexOffset, // first index
          0, // base vertex
          instanceIdx // meshletId // first instance TODO encode [meshletId+objectId]?
        );
        drawnTriangleCount += triangleCount;
      }
    }

    DrawNanitesPass.updateRenderStats(
      naniteObject,
      drawnMeshletsCount,
      drawnTriangleCount
    );
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    return assignResourcesToBindings2(
      DrawNanitesPass,
      naniteObject.name,
      device,
      this.renderPipeline,
      [
        globalUniforms.createBindingDesc(BINDINGS_RENDER_UNIFORMS),
        {
          binding: BINDINGS_INSTANCES_TRANSFORMS,
          resource: { buffer: naniteObject.instances.transformsBuffer },
        },
      ]
    );
  };

  public static updateRenderStats(
    naniteObject: NaniteObject | undefined,
    drawnMeshletsCount: number | undefined,
    drawnTriangleCount: number | undefined
  ) {
    if (!naniteObject) {
      STATS.update('Nanite meshlets', '-');
      STATS.update('Nanite triangles', '-');
      return;
    }

    const rawStats = getPreNaniteStats(naniteObject);
    const fmt = (drawn: number, total: number) => {
      const percent = ((drawn / total) * 100) / naniteObject.instancesCount;
      return `${formatNumber(drawn, 1)} (${percent.toFixed(1)}%)`;
    };

    if (drawnMeshletsCount !== undefined) {
      STATS.update('Nanite meshlets' , fmt(drawnMeshletsCount, rawStats.meshletCount)); // prettier-ignore
    }
    if (drawnTriangleCount !== undefined) {
      STATS.update('Nanite triangles', fmt(drawnTriangleCount, rawStats.triangleCount)); // prettier-ignore
    }
  }
}
