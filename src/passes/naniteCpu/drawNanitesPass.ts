import { BYTES_VEC2, BYTES_VEC3, VERTS_IN_TRIANGLE } from '../../constants.ts';
import {
  BindingsCache,
  PIPELINE_DEPTH_STENCIL_ON,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  assignResourcesToBindings2,
  getClearColorVec3,
  labelPipeline,
  labelShader,
  setNaniteDrawStats,
  setNaniteInstancesStats,
  useColorAttachment,
  useDepthStencilAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import {
  calcCotHalfFov,
  calcNaniteMeshletsVisibility,
} from './calcNaniteMeshletsVisibility.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import { SHADER_CODE, SHADER_PARAMS } from './drawNanitesPass.wgsl.ts';
import { assertIsGPUTextureView } from '../../utils/webgpu.ts';
import { getDiffuseTexture } from '../../scene/scene.ts';

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
  {
    attributes: [
      {
        shaderLocation: 1, // normals
        offset: 0,
        format: 'float32x3', // only nanite object uses octahedron normals
      },
    ],
    arrayStride: BYTES_VEC3,
    stepMode: 'vertex',
  },
  {
    attributes: [
      {
        shaderLocation: 2, // uv
        offset: 0,
        format: 'float32x2',
      },
    ],
    arrayStride: BYTES_VEC2,
    stepMode: 'vertex',
  },
];

export class DrawNanitesPass {
  public static NAME: string = DrawNanitesPass.name;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  // current frame stats
  private drawnMeshletsCount = 0;
  private drawnTriangleCount = 0;
  private culledInstancesCount = 0;

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    this.renderPipeline = DrawNanitesPass.createRenderPipeline(
      device,
      outTextureFormat
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    const shaderModule = device.createShaderModule({
      label: labelShader(DrawNanitesPass),
      code: SHADER_CODE(),
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

  initFrameStats() {
    this.drawnMeshletsCount = 0;
    this.drawnTriangleCount = 0;
    this.culledInstancesCount = 0;
  }

  uploadFrameStats({ scene }: PassCtx) {
    setNaniteDrawStats(scene, this.drawnMeshletsCount, this.drawnTriangleCount);
    const drawnInstancesCount =
      scene.totalInstancesCount - this.culledInstancesCount;
    setNaniteInstancesStats(scene, drawnInstancesCount);
  }

  draw(ctx: PassCtx, naniteObject: NaniteObject, loadOp: GPULoadOp) {
    const { cmdBuf, profiler, depthTexture, screenTexture } = ctx;

    // in this fn, time taken is on CPU, as GPU is async. Not 100% accurate, but good enough?
    const visibilityCheckProfiler = profiler?.startRegionCpu('VisibilityCheckCPU'); // prettier-ignore

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DrawNanitesPass.NAME,
      colorAttachments: [
        useColorAttachment(screenTexture, getClearColorVec3(), loadOp),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture, loadOp),
      timestampWrites: profiler?.createScopeGpu(DrawNanitesPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);

    // draw
    this.renderNaniteObject(ctx, renderPass, naniteObject);

    // fin
    profiler?.endRegionCpu(visibilityCheckProfiler);
    renderPass.end();
  }

  private renderNaniteObject(
    ctx: PassCtx,
    renderPass: GPURenderPassEncoder,
    naniteObject: NaniteObject
  ) {
    const instances = naniteObject.instances.transforms;
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, naniteObject)
    );

    renderPass.setBindGroup(0, bindings);
    renderPass.setVertexBuffer(0, naniteObject.originalMesh.vertexBuffer);
    renderPass.setVertexBuffer(1, naniteObject.originalMesh.normalsBuffer);
    renderPass.setVertexBuffer(2, naniteObject.originalMesh.uvBuffer);
    renderPass.setIndexBuffer(naniteObject.indexBuffer, 'uint32');

    const cotHalfFov = calcCotHalfFov(); // ~2.414213562373095,

    for (let instanceIdx = 0; instanceIdx < instances.length; instanceIdx++) {
      const instanceModelMat = instances[instanceIdx];
      const toDrawCount = calcNaniteMeshletsVisibility(
        ctx,
        cotHalfFov,
        instanceModelMat,
        naniteObject
      );
      if (toDrawCount === 0) {
        this.culledInstancesCount += 1;
        continue;
      }
      this.drawnMeshletsCount += toDrawCount;

      for (let mIdx = 0; mIdx < toDrawCount; mIdx++) {
        const m = naniteObject.naniteVisibilityBufferCPU.drawnMeshlets[mIdx];
        const triangleCount = m.triangleCount;
        const vertexCount = triangleCount * VERTS_IN_TRIANGLE;
        // we draw 1 instance, but we can use 'firstInstance'
        // to send additional data to the GPU for free.
        // Can only use for transformId. No meshletId in shader.
        renderPass.drawIndexed(
          vertexCount,
          1, // instance count
          m.firstIndexOffset, // first index
          0, // base vertex
          instanceIdx // first instance
        );
        this.drawnTriangleCount += triangleCount;
      }
    }
  }

  private createBindings = (
    { device, globalUniforms, scene }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;
    const diffuseTextureView = getDiffuseTexture(scene, naniteObject);
    assertIsGPUTextureView(diffuseTextureView);

    return assignResourcesToBindings2(
      DrawNanitesPass,
      naniteObject.name,
      device,
      this.renderPipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        {
          binding: b.instancesTransforms,
          resource: { buffer: naniteObject.instances.transformsBuffer },
        },
        { binding: b.diffuseTexture, resource: diffuseTextureView },
        { binding: b.sampler, resource: scene.defaultSampler },
      ]
    );
  };
}
