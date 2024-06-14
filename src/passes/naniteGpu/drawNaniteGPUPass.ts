import { CONFIG } from '../../constants.ts';
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
import {
  SHADER_SNIPPET_DRAWN_MESHLETS_LIST,
  SHADER_SNIPPET_MESHLET_TREE_NODES,
} from './naniteVisibilityPass.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';

// TODO connect to stats (somehow?). Then debug we are actually only drawing minmal set of meshlets (53 on bunny closeup)

const BINDINGS_RENDER_UNIFORMS = 0;
const BINDINGS_MESHLETS = 1;
const BINDINGS_DRAWN_MESHLET_IDS = 2;
const BINDINGS_INSTANCES_TRANSFORMS = 3;
const BINDINGS_VERTEX_POSITIONS = 4;
const BINDINGS_INDEX_BUFFER = 5;

export const VERTEX_ATTRIBUTES: GPUVertexBufferLayout[] = [];

export class DrawNaniteGPUPass {
  public static NAME: string = DrawNaniteGPUPass.name;
  public static SHADER_CODE: string;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly uniformsBindings: GPUBindGroup;

  constructor(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat,
    uniforms: RenderUniformsBuffer,
    naniteObject: NaniteObject
  ) {
    this.renderPipeline = DrawNaniteGPUPass.createRenderPipeline(
      device,
      outTextureFormat
    );

    this.uniformsBindings = assignResourcesToBindings(
      DrawNaniteGPUPass,
      device,
      this.renderPipeline,
      [
        uniforms.createBindingDesc(BINDINGS_RENDER_UNIFORMS),
        naniteObject.bufferBindingMeshlets(BINDINGS_MESHLETS),
        naniteObject.bufferBindingVisibility(BINDINGS_DRAWN_MESHLET_IDS),
        naniteObject.bufferBindingInstanceTransforms(
          BINDINGS_INSTANCES_TRANSFORMS
        ),
        naniteObject.bufferBindingVertexBufferForStorageAsVec4(
          BINDINGS_VERTEX_POSITIONS
        ),
        naniteObject.bufferBindingIndexBuffer(BINDINGS_INDEX_BUFFER),
      ]
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    assertHasShaderCode(DrawNaniteGPUPass);
    // TODO duplicated code from normal DrawNanitePass
    const shaderModule = device.createShaderModule({
      label: labelShader(DrawNaniteGPUPass),
      code: `
${RenderUniformsBuffer.SHADER_SNIPPET(BINDINGS_RENDER_UNIFORMS)}
${SHADER_SNIPPET_MESHLET_TREE_NODES(BINDINGS_MESHLETS)}
${SHADER_SNIPPET_DRAWN_MESHLETS_LIST(BINDINGS_DRAWN_MESHLET_IDS, 'read')}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_CHECK_IS_CULLED}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${DrawNaniteGPUPass.SHADER_CODE}
      `,
    });

    return device.createRenderPipeline({
      label: labelPipeline(DrawNaniteGPUPass),
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

  draw(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler, depthTexture, screenTexture } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DrawNaniteGPUPass.NAME,
      colorAttachments: [useColorAttachment(screenTexture, CONFIG.clearColor)],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DrawNaniteGPUPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    // this.debugRenderNaniteObjects(ctx, renderPass);
    renderPass.drawIndirect(naniteObject.drawIndirectBuffer, 0);

    // fin
    renderPass.end();
  }

  /*
  private debugRenderNaniteObjects(ctx: PassCtx, renderPass: GPURenderPassEncoder) {
    // const instances = ctx.scene.naniteInstances.transforms;
    const nanite = ctx.scene.naniteObject;

    // renderPass.setVertexBuffer(0, nanite.vertexBuffer);
    // renderPass.setIndexBuffer(nanite.indexBuffer, 'uint32');
    renderPass.set(nanite.indexBuffer, 'uint32');

    const drawnMeshlets = nanite.allMeshlets.filter((m) => m.lodLevel === 0);
    // this.reportDrawn(drawnMeshlets);
    const vertexCount =
      CONFIG.nanite.preprocess.meshletMaxTriangles * VERTS_IN_TRIANGLE;

    drawnMeshlets.forEach((meshlet) => {
      renderPass.draw(
        vertexCount,
        1, // instance count
        0, // first vertex
        meshlet.id // instanceId
      );
    });
  }
  
  // deno-lint-ignore no-explicit-any
  private reportDrawn = once((...args: any[]) => console.log('Drawn', ...args));
  */
}
