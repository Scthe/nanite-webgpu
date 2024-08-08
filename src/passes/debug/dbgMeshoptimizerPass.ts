import { CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import { VERTEX_ATTRIBUTE_POSITION } from '../../scene/GPUOriginalMesh.ts';
import { getDebugTestObject } from '../../scene/scene.ts';
import {
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assignResourcesToBindings,
  getClearColorVec3,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SHADER_CODE } from './dbgMeshoptimizerPass.wgsl.ts';

export class DbgMeshoptimizerPass {
  public static NAME: string = 'DbgMeshoptimizerPass';

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
      DbgMeshoptimizerPass,
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
      code: SHADER_CODE(),
    });

    return device.createRenderPipeline({
      label: labelPipeline(DbgMeshoptimizerPass),
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: [VERTEX_ATTRIBUTE_POSITION],
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
    const { cmdBuf, profiler, depthTexture, hdrRenderTexture, scene } = ctx;

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DbgMeshoptimizerPass.NAME,
      colorAttachments: [
        useColorAttachment(hdrRenderTexture, getClearColorVec3()),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DbgMeshoptimizerPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, this.uniformsBindings);

    // draw
    const [debugMeshes, _nanite] = getDebugTestObject(scene);
    const mesh = debugMeshes.meshoptimizerLODs[CONFIG.dbgMeshoptimizerLodLevel];
    renderPass.setVertexBuffer(0, mesh.vertexBuffer);
    renderPass.setIndexBuffer(mesh.indexBuffer, 'uint32');
    const vertexCount = mesh.triangleCount * VERTS_IN_TRIANGLE;
    renderPass.drawIndexed(vertexCount, 1, 0, 0, 0);

    // fin
    renderPass.end();
  }
}
