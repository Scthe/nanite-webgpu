import { CONFIG, VERTS_IN_TRIANGLE } from '../constants.ts';
import * as SHADER_SNIPPETS from './_shaderSnippets.ts';
import {
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assignResourcesToBindings,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from './_shared.ts';
import { VERTEX_ATTRIBUTES } from './drawMeshPass.ts';
import { PassCtx } from './passCtx.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';

export class DbgMeshoptimizerPass {
  public static NAME: string = DbgMeshoptimizerPass.name;
  public static SHADER_CODE: string;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly uniformsBindings: GPUBindGroup;

  constructor(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat,
    uniforms: RenderUniformsBuffer
  ) {
    this.renderPipeline = DbgMeshoptimizerPass.createRenderPipeline(
      device,
      outTextureFormat
    );
    this.uniformsBindings = assignResourcesToBindings(
      device,
      this.renderPipeline,
      [uniforms.createBindingDesc(0)]
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    const shaderModule = device.createShaderModule({
      label: labelShader(DbgMeshoptimizerPass),
      code: `
${RenderUniformsBuffer.SHADER_SNIPPET(0)}
${SHADER_SNIPPETS.FS_CHECK_IS_CULLED}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${DbgMeshoptimizerPass.SHADER_CODE}
      `,
    });

    return device.createRenderPipeline({
      label: labelPipeline(DbgMeshoptimizerPass),
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

  draw(ctx: PassCtx, targetTexture: GPUTexture, loadOp: GPULoadOp) {
    const { cmdBuf, profiler, depthTexture, scene } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DbgMeshoptimizerPass.NAME,
      colorAttachments: [
        useColorAttachment(targetTexture, loadOp, CONFIG.clearColor),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DbgMeshoptimizerPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    const mesh = scene.meshoptimizerLODs[CONFIG.dbgMeshoptimizerLodLevel];
    renderPass.setVertexBuffer(0, mesh.vertexBuffer);
    renderPass.setIndexBuffer(mesh.indexBuffer, 'uint32');
    const vertexCount = mesh.triangleCount * VERTS_IN_TRIANGLE;
    renderPass.drawIndexed(vertexCount, 1, 0, 0, 0);

    // fin
    renderPass.end();
  }
}
