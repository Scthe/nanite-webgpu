import { CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import { Scene } from '../../scene/scene.ts';
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
import { VERTEX_ATTRIBUTES } from '../naniteCpu/drawNanitesPass.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

export class DbgMeshoptimizerMeshletsPass {
  public static NAME: string = DbgMeshoptimizerMeshletsPass.name;
  public static SHADER_CODE: string;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly uniformsBindings: GPUBindGroup;

  constructor(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat,
    uniforms: RenderUniformsBuffer
  ) {
    this.renderPipeline = DbgMeshoptimizerMeshletsPass.createRenderPipeline(
      device,
      outTextureFormat
    );
    this.uniformsBindings = assignResourcesToBindings(
      DbgMeshoptimizerMeshletsPass,
      device,
      this.renderPipeline,
      [uniforms.createBindingDesc(0)]
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    assertHasShaderCode(DbgMeshoptimizerMeshletsPass);
    const shaderModule = device.createShaderModule({
      label: labelShader(DbgMeshoptimizerMeshletsPass),
      code: `
${RenderUniformsBuffer.SHADER_SNIPPET(0)}
${SHADER_SNIPPETS.FS_CHECK_IS_CULLED}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${DbgMeshoptimizerMeshletsPass.SHADER_CODE}
      `,
    });

    return device.createRenderPipeline({
      label: labelPipeline(DbgMeshoptimizerMeshletsPass),
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
    const { cmdBuf, profiler, depthTexture, screenTexture, scene } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DbgMeshoptimizerMeshletsPass.NAME,
      colorAttachments: [useColorAttachment(screenTexture, CONFIG.clearColor)],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(
        DbgMeshoptimizerMeshletsPass.NAME
      ),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    if (CONFIG.displayMode === 'dbg-nanite-meshlets') {
      this.drawNaniteDbg(renderPass, scene);
    } else {
      this.drawMeshoptimizerMeshletLODs(renderPass, scene);
    }

    // fin
    renderPass.end();
  }

  private drawMeshoptimizerMeshletLODs(
    renderPass: GPURenderPassEncoder,
    scene: Scene
  ) {
    const meshlets =
      scene.debugMeshes.meshoptimizerMeshletLODs[
        CONFIG.dbgMeshoptimizerLodLevel
      ];
    renderPass.setVertexBuffer(0, meshlets.vertexBuffer);
    renderPass.setIndexBuffer(meshlets.indexBuffer, 'uint32');
    let nextIdx = 0;
    meshlets.meshlets.forEach((m, firstInstance) => {
      const vertexCount = m.triangleCount * VERTS_IN_TRIANGLE;
      const firstIndex = nextIdx;
      renderPass.drawIndexed(vertexCount, 1, firstIndex, 0, firstInstance);
      nextIdx += vertexCount;
    });
  }

  private drawNaniteDbg(renderPass: GPURenderPassEncoder, scene: Scene) {
    const nanite = scene.naniteObject;
    renderPass.setVertexBuffer(0, nanite.vertexBuffer);
    renderPass.setIndexBuffer(nanite.indexBuffer, 'uint32');

    const drawnMeshlets = nanite.allMeshlets.filter(
      (m) => m.lodLevel === CONFIG.dbgNaniteLodLevel
    );
    drawnMeshlets.forEach((m, meshletIdx) => {
      const vertexCount = m.triangleCount * VERTS_IN_TRIANGLE;
      renderPass.drawIndexed(
        vertexCount,
        1, // instance count
        m.firstIndexOffset, // first index
        0, // base vertex
        meshletIdx
      );
    });
  }
}
