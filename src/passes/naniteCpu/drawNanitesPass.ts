import { BYTES_VEC3, CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';
import {
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assertHasShaderCode,
  assignResourcesToBindings,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { calcNaniteMeshletsVisibility } from './calcNaniteMeshletsVisibility.ts';
import { NaniteObject, getPreNaniteStats } from '../../scene/naniteObject.ts';
import { STATS } from '../../sys_web/stats.ts';
import { formatNumber } from '../../utils/index.ts';

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
  private readonly uniformsBindings: GPUBindGroup;

  constructor(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat,
    uniforms: RenderUniformsBuffer,
    naniteObject: NaniteObject
  ) {
    this.renderPipeline = DrawNanitesPass.createRenderPipeline(
      device,
      outTextureFormat
    );

    this.uniformsBindings = assignResourcesToBindings(
      DrawNanitesPass,
      device,
      this.renderPipeline,
      [
        uniforms.createBindingDesc(BINDINGS_RENDER_UNIFORMS),
        {
          binding: BINDINGS_INSTANCES_TRANSFORMS,
          resource: { buffer: naniteObject.instances.transformsBuffer },
        },
      ]
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    assertHasShaderCode(DrawNanitesPass);
    const shaderModule = device.createShaderModule({
      label: labelShader(DrawNanitesPass),
      code: `
${RenderUniformsBuffer.SHADER_SNIPPET(BINDINGS_RENDER_UNIFORMS)}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_CHECK_IS_CULLED}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${DrawNanitesPass.SHADER_CODE}
      `,
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
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    this.renderNaniteObjects(ctx, renderPass);

    // fin
    profiler?.endRegionCpu(visibilityCheckProfiler);
    renderPass.end();
  }

  private renderNaniteObjects(ctx: PassCtx, renderPass: GPURenderPassEncoder) {
    const naniteObject = ctx.scene.naniteObject;
    const instances = naniteObject.instances.transforms;

    renderPass.setVertexBuffer(0, naniteObject.vertexBuffer);
    renderPass.setIndexBuffer(naniteObject.indexBuffer, 'uint32');

    let drawnTriangleCount = 0;
    let drawnMeshletsCount = 0;

    instances.forEach((instanceModelMat, instanceIdx) => {
      const drawnMeshlets = calcNaniteMeshletsVisibility(
        ctx,
        instanceModelMat,
        naniteObject
      );
      drawnMeshletsCount += drawnMeshlets.length;

      drawnMeshlets.forEach((m) => {
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
      });
    });

    const rawStats = getPreNaniteStats(naniteObject);
    const fmt = (drawn: number, total: number) => {
      const percent = ((drawn / total) * 100) / naniteObject.instancesCount;
      return `${formatNumber(drawn, 1)} (${percent.toFixed(1)}%)`;
    };
    STATS.update('Nanite meshlets' , fmt(drawnMeshletsCount, rawStats.meshletCount)); // prettier-ignore
    STATS.update('Nanite triangles', fmt(drawnTriangleCount, rawStats.triangleCount)); // prettier-ignore
  }
}
