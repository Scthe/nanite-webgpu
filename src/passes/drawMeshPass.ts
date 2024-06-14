import { BYTES_VEC3, CONFIG, STATS, VERTS_IN_TRIANGLE } from '../constants.ts';
import * as SHADER_SNIPPETS from './_shaderSnippets.ts';
import {
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assertHasShaderCode,
  assignResourcesToBindings,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from './_shared.ts';
import { PassCtx } from './passCtx.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';
import { calcNaniteMeshletsVisibility } from './naniteUtils.ts';
import { NaniteLODTree } from '../scene/naniteLODTree.ts';

// TODO rename drawNanitesPass()? Move rest of passes to ./dbg

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

export class DrawMeshPass {
  public static NAME: string = DrawMeshPass.name;
  public static SHADER_CODE: string;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly uniformsBindings: GPUBindGroup;

  constructor(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat,
    uniforms: RenderUniformsBuffer,
    naniteObject: NaniteLODTree
  ) {
    this.renderPipeline = DrawMeshPass.createRenderPipeline(
      device,
      outTextureFormat
    );

    this.uniformsBindings = assignResourcesToBindings(
      DrawMeshPass,
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
    assertHasShaderCode(DrawMeshPass);
    const shaderModule = device.createShaderModule({
      label: labelShader(DrawMeshPass),
      code: `
${RenderUniformsBuffer.SHADER_SNIPPET(BINDINGS_RENDER_UNIFORMS)}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_CHECK_IS_CULLED}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${DrawMeshPass.SHADER_CODE}
      `,
    });

    return device.createRenderPipeline({
      label: labelPipeline(DrawMeshPass),
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

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DrawMeshPass.NAME,
      colorAttachments: [useColorAttachment(screenTexture, CONFIG.clearColor)],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DrawMeshPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    this.renderNaniteObjects(ctx, renderPass);

    // fin
    renderPass.end();
  }

  private renderNaniteObjects(ctx: PassCtx, renderPass: GPURenderPassEncoder) {
    const nanite = ctx.scene.naniteObject;
    const instances = nanite.instances.transforms;

    renderPass.setVertexBuffer(0, nanite.vertexBuffer);
    renderPass.setIndexBuffer(nanite.indexBuffer, 'uint32');

    let totalTriangleCount = 0;
    let totalDrawnMeshlets = 0;

    instances.forEach((instanceModelMat, instanceIdx) => {
      const drawnMeshlets = calcNaniteMeshletsVisibility(
        ctx,
        instanceModelMat,
        nanite
      );

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
        totalTriangleCount += triangleCount;
      });
      totalDrawnMeshlets += drawnMeshlets.length;
    });

    const [rawMeshletCount, rawTriangleCount] = nanite.preNaniteStats;
    STATS['Pre-Nanite meshlets:'] = rawMeshletCount * instances.length;
    STATS['Pre-Nanite triangles:'] = rawTriangleCount * instances.length;
    STATS['Nanite meshlets:'] = totalDrawnMeshlets;
    STATS['Nanite triangles:'] = totalTriangleCount;
  }
}
