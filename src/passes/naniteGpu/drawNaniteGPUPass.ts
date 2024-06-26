import {
  BindingsCache,
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assignResourcesToBindings2,
  getClearColorVec3,
  labelPipeline,
  labelShader,
  useColorAttachment,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import { SHADER_CODE, SHADER_PARAMS } from './drawNaniteGPUPass.wgsl.ts';
import { getDiffuseTexture } from '../../scene/scene.ts';
import { assertIsGPUTextureView } from '../../utils/webgpu.ts';

export const VERTEX_ATTRIBUTES: GPUVertexBufferLayout[] = [];

export class DrawNaniteGPUPass {
  public static NAME: string = DrawNaniteGPUPass.name;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    this.renderPipeline = DrawNaniteGPUPass.createRenderPipeline(
      device,
      outTextureFormat
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    const shaderModule = device.createShaderModule({
      label: labelShader(DrawNaniteGPUPass),
      code: SHADER_CODE(),
    });

    // TODO duplicated code from normal DrawNanitePass
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
      colorAttachments: [
        useColorAttachment(screenTexture, getClearColorVec3()),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DrawNaniteGPUPass.NAME),
    });
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, naniteObject)
    );

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);
    renderPass.setBindGroup(0, bindings);

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

  private createBindings = (
    { device, globalUniforms, scene }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    const diffuseTextureView = getDiffuseTexture(scene, naniteObject);
    assertIsGPUTextureView(diffuseTextureView);

    return assignResourcesToBindings2(
      DrawNaniteGPUPass,
      naniteObject.name,
      device,
      this.renderPipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        naniteObject.bufferBindingMeshlets(b.meshlets),
        naniteObject.bufferBindingVisibility(b.drawnMeshletIds),
        naniteObject.bufferBindingInstanceTransforms(b.instancesTransforms),
        naniteObject.bufferBindingVertexBufferForStorageAsVec4(
          b.vertexPositions
        ),
        naniteObject.bufferBindingOctahedronNormals(b.vertexNormals),
        naniteObject.bufferBindingUV(b.vertexUV),
        naniteObject.bufferBindingIndexBuffer(b.indexBuffer),
        { binding: b.diffuseTexture, resource: diffuseTextureView },
        { binding: b.sampler, resource: scene.defaultSampler },
      ]
    );
  };
}
