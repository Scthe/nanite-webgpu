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

// TODO rename drawNanitesPass()?

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
    uniforms: RenderUniformsBuffer
  ) {
    this.renderPipeline = DrawMeshPass.createRenderPipeline(
      device,
      outTextureFormat
    );
    this.uniformsBindings = assignResourcesToBindings(
      DrawMeshPass,
      device,
      this.renderPipeline,
      [uniforms.createBindingDesc(0)]
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
${RenderUniformsBuffer.SHADER_SNIPPET(0)}
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

  draw(ctx: PassCtx, loadOp: GPULoadOp) {
    const { cmdBuf, profiler, depthTexture, screenTexture, scene } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DrawMeshPass.NAME,
      colorAttachments: [
        useColorAttachment(screenTexture, loadOp, CONFIG.clearColor),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DrawMeshPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    this.renderNaniteObject(ctx, renderPass, scene.naniteObject);

    // fin
    renderPass.end();
  }

  private renderNaniteObject(
    ctx: PassCtx,
    renderPass: GPURenderPassEncoder,
    nanite: NaniteLODTree
  ) {
    renderPass.setVertexBuffer(0, nanite.vertexBuffer);

    const drawnMeshlets = calcNaniteMeshletsVisibility(ctx, nanite);
    let totalTriangleCount = 0;
    drawnMeshlets.forEach((m, firstInstance) => {
      renderPass.setIndexBuffer(m.indexBuffer!, 'uint32');
      const triangleCount = m.triangleCount;
      const vertexCount = triangleCount * VERTS_IN_TRIANGLE;
      renderPass.drawIndexed(vertexCount, 1, 0, 0, firstInstance);
      totalTriangleCount += triangleCount;
    });
    STATS['Nanite meshlets:'] = drawnMeshlets.length;
    STATS['Nanite triangles:'] = totalTriangleCount;
  }
}
