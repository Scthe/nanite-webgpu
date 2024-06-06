import { CONFIG, DEPTH_FORMAT, VERTS_IN_TRIANGLE } from '../constants.ts';
import { VERTEX_ATTRIBUTES } from './drawMeshPass.ts';
import { PassCtx } from './passCtx.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';

// TODO tons of duplicate code from DrawMeshPass
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
    this.uniformsBindings = DbgMeshoptimizerPass.assignResourcesToBindings(
      device,
      this.renderPipeline.getBindGroupLayout(0),
      uniforms
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    const shaderModule = device.createShaderModule({
      label: `${DbgMeshoptimizerPass.NAME}-shaders`,
      code: DbgMeshoptimizerPass.SHADER_CODE,
    });

    const renderPipeline = device.createRenderPipeline({
      label: `${DbgMeshoptimizerPass.NAME}-pipeline`,
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
      primitive: {
        cullMode: 'none',
        topology: 'triangle-list',
        stripIndexFormat: undefined,
      },
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: 'less-equal',
        format: DEPTH_FORMAT,
      },
    });

    return renderPipeline;
  }

  private static assignResourcesToBindings(
    device: GPUDevice,
    uniformsLayout: GPUBindGroupLayout,
    uniforms: RenderUniformsBuffer
  ) {
    return device.createBindGroup({
      layout: uniformsLayout,
      entries: [uniforms.createBindingDesc(0)],
    });
  }

  draw(ctx: PassCtx, targetTexture: GPUTexture, loadOp: GPULoadOp) {
    const { cmdBuf, profiler, depthTexture, scene } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DbgMeshoptimizerPass.NAME,
      colorAttachments: [
        {
          view: targetTexture.createView(),
          loadOp,
          storeOp: 'store',
          clearValue: [
            CONFIG.clearColor[0],
            CONFIG.clearColor[1],
            CONFIG.clearColor[2],
            1,
          ],
        },
      ],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear',
        depthStoreOp: 'store',
      },
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
