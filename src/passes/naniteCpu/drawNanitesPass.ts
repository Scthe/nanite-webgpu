import { BYTES_VEC3, VERTS_IN_TRIANGLE } from '../../constants.ts';
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
import {
  calcCotHalfFov,
  calcNaniteMeshletsVisibility,
} from './calcNaniteMeshletsVisibility.ts';
import { NaniteObject, getPreNaniteStats } from '../../scene/naniteObject.ts';
import { STATS } from '../../sys_web/stats.ts';
import { formatNumber } from '../../utils/index.ts';
import { SHADER_CODE, SHADER_PARAMS } from './drawNanitesPass.wgsl.ts';

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
        format: 'float32x3',
      },
    ],
    arrayStride: BYTES_VEC3,
    stepMode: 'vertex',
  },
];

export class DrawNanitesPass {
  public static NAME: string = DrawNanitesPass.name;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

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

  draw(ctx: PassCtx) {
    const { cmdBuf, profiler, depthTexture, screenTexture } = ctx;

    // in this fn, time taken is on CPU, as GPU is async. Not 100% accurate, but good enough?
    const visibilityCheckProfiler = profiler?.startRegionCpu('VisibilityCheckCPU'); // prettier-ignore

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const renderPass = cmdBuf.beginRenderPass({
      label: DrawNanitesPass.NAME,
      colorAttachments: [
        useColorAttachment(screenTexture, getClearColorVec3()),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture),
      timestampWrites: profiler?.createScopeGpu(DrawNanitesPass.NAME),
    });

    // set render pass data
    renderPass.setPipeline(this.renderPipeline);

    // draw
    this.renderNaniteObject(ctx, renderPass, ctx.scene.naniteObject);

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
    renderPass.setIndexBuffer(naniteObject.indexBuffer, 'uint32');

    let drawnTriangleCount = 0;
    let drawnMeshletsCount = 0;
    let culledInstances = 0;
    const cotHalfFov = calcCotHalfFov(); // ~2.414213562373095,

    for (let instanceIdx = 0; instanceIdx < instances.length; instanceIdx++) {
      const instanceModelMat = instances[instanceIdx];
      const toDrawCount = calcNaniteMeshletsVisibility(
        ctx,
        cotHalfFov,
        instanceModelMat,
        naniteObject
      );
      drawnMeshletsCount += toDrawCount;
      if (toDrawCount === 0) {
        culledInstances += 1;
        continue;
      }

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
        drawnTriangleCount += triangleCount;
      }
    }

    DrawNanitesPass.updateRenderStats(
      naniteObject,
      drawnMeshletsCount,
      drawnTriangleCount,
      culledInstances
    );
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

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
      ]
    );
  };

  public static updateRenderStats(
    naniteObject: NaniteObject | undefined,
    drawnMeshletsCount: number | undefined,
    drawnTriangleCount: number | undefined,
    culledInstances: number | undefined
  ) {
    if (!naniteObject) {
      STATS.update('Nanite meshlets', '-');
      STATS.update('Nanite triangles', '-');
      return;
    }

    const rawStats = getPreNaniteStats(naniteObject);

    const fmt = (drawn: number, total: number, decimals = 1) => {
      const percent = ((drawn / total) * 100.0) / naniteObject.instancesCount;
      return `${formatNumber(drawn, decimals)} (${percent.toFixed(1)}%)`;
    };

    if (drawnMeshletsCount !== undefined) {
      STATS.update('Nanite meshlets' , fmt(drawnMeshletsCount, rawStats.meshletCount)); // prettier-ignore
    }
    if (drawnTriangleCount !== undefined) {
      STATS.update('Nanite triangles', fmt(drawnTriangleCount, rawStats.triangleCount)); // prettier-ignore
    }
    if (culledInstances !== undefined) {
      STATS.update('Culled instances', fmt(culledInstances, 1)); // prettier-ignore
    }
    // if (backfaceCulledMeshletsCount !== undefined) {
    // STATS.update('Backface meshlets', fmt(backfaceCulledMeshletsCount, rawStats.meshletCount, 0)); // prettier-ignore
    // }
  }
}
