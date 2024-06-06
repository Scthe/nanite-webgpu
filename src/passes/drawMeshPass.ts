import { BYTES_VEC3, CONFIG, DEPTH_FORMAT } from '../constants.ts';
import { PassCtx } from './passCtx.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';

const VERTEX_ATTRIBUTES: GPUVertexBufferLayout[] = [
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
    this.uniformsBindings = DrawMeshPass.assignResourcesToBindings(
      device,
      this.renderPipeline.getBindGroupLayout(0),
      uniforms
    );
    // this.uniformsBindings = undefined!;
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    const shaderModule = device.createShaderModule({
      label: `${DrawMeshPass.NAME}-shaders`,
      code: DrawMeshPass.SHADER_CODE,
    });

    const renderPipeline = device.createRenderPipeline({
      label: `${DrawMeshPass.NAME}-pipeline`,
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
      label: DrawMeshPass.NAME,
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
      timestampWrites: profiler?.createScopeGpu(DrawMeshPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);
    /*
    renderPass.setVertexBuffer(0, mesh.vertexBuffer);
    renderPass.setIndexBuffer(mesh.indexBuffer, 'uint32');
    // draw
    const vertexCount = mesh.triangleCount * 3;
    renderPass.drawIndexed(vertexCount, 1, 0, 0, 0);
    */

    // meshlets test
    const ms = scene.meshlets;
    renderPass.setVertexBuffer(0, ms.vertexBuffer);
    renderPass.setIndexBuffer(ms.indexBuffer, 'uint32');
    let nextIdx = 0;
    ms.meshlets.forEach((m, firstInstance) => {
      const vertexCount = m.triangleCount * 3;
      const firstIndex = nextIdx;
      renderPass.drawIndexed(vertexCount, 1, firstIndex, 0, firstInstance);
      nextIdx += vertexCount;
    });

    // fin
    renderPass.end();
  }
}
