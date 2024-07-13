import { vec4 } from 'wgpu-matrix';
import { boundsCalculator } from '../utils/calcBounds.ts';
import {
  BindingsCache,
  PIPELINE_DEPTH_STENCIL_ON,
  assignResourcesToBindings2,
  getClearColorVec3,
  useColorAttachment,
  useDepthStencilAttachment,
} from './_shared.ts';
import { PassCtx } from './passCtx.ts';
import { RenderUniformsBuffer } from './renderUniformsBuffer.ts';
import { projectPoint } from '../utils/index.ts';
import { CAMERA_CFG } from '../constants.ts';

/** Software rasterizer depth has the whole 16-bit hack.
 * TBH the fix based on blend is better, but this can also help.
 */
const SOFTW_RASTER_DEPTH_16BIT_FIX =
  ((CAMERA_CFG.far - CAMERA_CFG.near) / 0xffff) * 100.0;

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
  },
};
const b = SHADER_PARAMS.bindings;

const SHADER_CODE = (
  offset: string,
  span: string,
  floorHeight: string
) => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}

const H = ${floorHeight};
const OFFSET = ${offset};
const SPAN = ${span};


struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
};

@vertex
fn main_vs(
  @builtin(vertex_index) in_vertex_index : u32
) -> VertexOutput {
  let offset0 = vec2f(
    f32(i32(in_vertex_index / 2u )), // [-1, -1, 0, 0]
    f32(i32(in_vertex_index & 1u)) // [-1, 1, -1, 1, ...]
  );
  
  let height = H - ${SOFTW_RASTER_DEPTH_16BIT_FIX};
  let offset = offset0 * SPAN + OFFSET;
  var pos = vec4<f32>(offset.x, height, offset.y, 1.);
  
  var result: VertexOutput;
  result.position = _uniforms.vpMatrix * pos;
  result.positionWS = pos;
  return result;
}

const C0: f32 = 0.15;
const C1: f32 = 0.3;
const BLUE  = vec3f(0.,   121., 255.) / 255.;
const RED   = vec3f(255., 0.,     0.) / 255.;
const GREEN = vec3f(143., 204.,  18.) / 255.;
const SATURATION = 0.6;

@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4f {
  let offsetFrom0 = SPAN + OFFSET;
  let posFromStart = fragIn.positionWS.xz - offsetFrom0;

  /*
  let patternMask = fract((floor(posFromStart.y) + floor(posFromStart.x)) / 2.0);
  let col0 = vec4f(C0, C0, C0, 1.0);
  let col1 = vec4f(C1, C1, C1, 1.0);
  return select(col0, col1, patternMask > 0.0);*/
  
  let mm = fract(floor(posFromStart) / 2.0);
  var color = vec3f(0.8);
  if(mm.x > 0.0 && mm.y > 0.0) { color = BLUE; }
  if(mm.x > 0.0 && mm.y == 0.0) { color = RED; }
  if(mm.x == 0.0 && mm.y > 0.0) { color = GREEN; }
  return vec4f(color * SATURATION, 1.0);
}
`;

export class DrawGroundPass {
  public static NAME: string = DrawGroundPass.name;

  private pipeline: GPURenderPipeline | undefined;
  private readonly bindingsCache = new BindingsCache();

  constructor(private readonly outTextureFormat: GPUTextureFormat) {}

  private getRenderPipeline(ctx: PassCtx): GPURenderPipeline {
    if (this.pipeline !== undefined) {
      return this.pipeline;
    }

    const { device } = ctx;
    const [offset, span, floorHeight] = calculateGroundSize(ctx);

    const code = SHADER_CODE(offset, span, floorHeight);
    const shaderModule = device.createShaderModule({ code });

    const renderPipeline = device.createRenderPipeline({
      label: 'ground-render',
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: [],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'main_fs',
        targets: [
          {
            format: this.outTextureFormat,
            blend: {
              // we cleared alpha at the start of the frame to 0.0.
              // if we drawn ANTHING, then we set it to 1.0.
              // if we did NOT draw ANYTHING, it's still 0.0
              color: {
                srcFactor: 'one-minus-dst-alpha',
                dstFactor: 'dst-alpha',
                operation: 'add',
              },
              alpha: {
                srcFactor: 'one',
                dstFactor: 'one',
                operation: 'add',
              },
            },
          },
        ],
      },
      primitive: {
        cullMode: 'back', // do not switch this off!
        topology: 'triangle-strip',
        stripIndexFormat: undefined,
      },
      depthStencil: PIPELINE_DEPTH_STENCIL_ON,
    });

    this.pipeline = renderPipeline;
    return renderPipeline;
  }

  cmdDrawGround(ctx: PassCtx, loadOp: GPULoadOp) {
    const { cmdBuf, profiler, depthTexture, hdrRenderTexture } = ctx;

    const renderPass = cmdBuf.beginRenderPass({
      label: DrawGroundPass.NAME,
      colorAttachments: [
        useColorAttachment(hdrRenderTexture, getClearColorVec3(), loadOp),
      ],
      depthStencilAttachment: useDepthStencilAttachment(depthTexture, loadOp),
      timestampWrites: profiler?.createScopeGpu(DrawGroundPass.NAME),
    });

    const pipeline = this.getRenderPipeline(ctx);

    const bindings = this.bindingsCache.getBindings(DrawGroundPass.NAME, () =>
      this.createBindings(ctx, pipeline)
    );

    // set render pass data
    renderPass.setPipeline(pipeline);
    renderPass.setBindGroup(0, bindings);
    renderPass.draw(4, 1, 0, 0);
    renderPass.end();
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    pipeline: GPURenderPipeline
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

    return assignResourcesToBindings2(DrawGroundPass, '', device, pipeline, [
      globalUniforms.createBindingDesc(b.renderUniforms),
    ]);
  };
}

function calculateGroundSize({ scene }: PassCtx) {
  const [bounds, addPoint] = boundsCalculator();
  const tmp = vec4.create();

  scene.naniteObjects.forEach((o) => {
    const bBox = o.bounds.box;
    o.instances.transforms.forEach((tfxMat) => {
      addPoint(projectPoint(tfxMat, bBox[0], tmp));
      addPoint(projectPoint(tfxMat, bBox[1], tmp));
    });
  });

  const offset = `vec2f(${bounds[0][0]}, ${bounds[0][2]})`;
  const spanXZ = [bounds[1][0] - bounds[0][0], bounds[1][2] - bounds[0][2]];
  const span = `vec2f(${spanXZ[0]}, ${spanXZ[1]})`;
  const floorHeight = `f32(${bounds[0][1]})`;
  // console.log({ floorHeight, bounds, offset, spanXZ });
  return [offset, span, floorHeight];
}
