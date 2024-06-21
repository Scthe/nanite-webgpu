import { CAMERA_CFG } from '../../constants.ts';
import { CLAMP_TO_MIP_LEVELS } from '../_shaderSnippets.ts';
import {
  BindingsCache,
  assignResourcesToBindings2,
  getClearColorVec3,
  labelPipeline,
  labelShader,
  useColorAttachment,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    depthPyramidTexture: 1,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
@group(0) @binding(${b.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;

${CLAMP_TO_MIP_LEVELS}

@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  var pos = array<vec2f, 3>(
    vec2(-1.0, 3.0),
    vec2(3.0, -1.0),
    vec2(-1.0, -1.0)
  );
  return vec4f(pos[VertexIndex], 0.0, 1.0);
}


@fragment
fn main_fs(
  // this is not uv, this in pixels
  @builtin(position) coord: vec4<f32>
) -> @location(0) vec4<f32> {
  let viewportSize = vec2f(_uniforms.viewport.x, _uniforms.viewport.y);
  var mipLevel: i32 = getDbgPyramidMipmapLevel();
  mipLevel = clampToMipLevels(mipLevel, _depthPyramidTexture);
  let mipSize = vec2f(textureDimensions(_depthPyramidTexture, mipLevel));
  let mipCoord = coord.xy / viewportSize * mipSize;

  var depth = textureLoad(_depthPyramidTexture, vec2u(mipCoord.xy), mipLevel).x;
  
  var c = vec3f(0., 0., 0.);
  if (depth == 1.0) { // far
    c.r = 1.0;
  } else {
    c.g = linearizeDepth_0_1(depth);
    c.b = 0.2;
  }

  return vec4(c, 1.0);
}

/** Returns value [zNear, zFar] */
fn linearizeDepth(depth: f32) -> f32 {
  let zNear: f32 = ${CAMERA_CFG.near};
  let zFar: f32 = ${CAMERA_CFG.far};
  
  // PP := projection matrix
  // PP[10] = zFar / (zNear - zFar);
  // PP[14] = (zFar * zNear) / (zNear - zFar);
  // PP[11] = -1 ; PP[15] = 0 ; w = 1 
  // z = PP[10] * p.z + PP[14] * w; // matrix mul, but x,y do not matter for z,w coords
  // w = PP[11] * p.z + PP[15] * w;
  // z' = z / w = (zFar / (zNear - zFar) * p.z + (zFar * zNear) / (zNear - zFar)) / (-p.z)
  // p.z = (zFar * zNear) / (zFar + (zNear - zFar) * z')
  return zNear * zFar / (zFar + (zNear - zFar) * depth);
  
  // OpenGL:
  // let z = depth * 2.0 - 1.0; // back to NDC
  // let z = depth;
  // return (2.0 * zNear * zFar) / (zFar + zNear - z * (zFar - zNear));
}

/** Returns value [0, 1] */
fn linearizeDepth_0_1(depth: f32) -> f32 {
  let zNear: f32 = ${CAMERA_CFG.near};
  let zFar: f32 = ${CAMERA_CFG.far};
  let d2 = linearizeDepth(depth);
  return d2 / (zFar - zNear);
}
`;

export class DepthPyramidDebugDrawPass {
  public static NAME: string = DepthPyramidDebugDrawPass.name;

  private readonly renderPipeline: GPURenderPipeline;
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice, outTextureFormat: GPUTextureFormat) {
    this.renderPipeline = DepthPyramidDebugDrawPass.createRenderPipeline(
      device,
      outTextureFormat
    );
  }

  private static createRenderPipeline(
    device: GPUDevice,
    outTextureFormat: GPUTextureFormat
  ) {
    const shaderModule = device.createShaderModule({
      label: labelShader(DepthPyramidDebugDrawPass),
      code: SHADER_CODE(),
    });

    return device.createRenderPipeline({
      label: labelPipeline(DepthPyramidDebugDrawPass),
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: [],
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'main_fs',
        targets: [{ format: outTextureFormat }],
      },
      primitive: { topology: 'triangle-list' },
    });
  }

  onDepthTextureResize = () => this.bindingsCache.clear();

  cmdDraw(ctx: PassCtx) {
    const { cmdBuf, profiler, screenTexture, depthTexture } = ctx;

    const renderPass = cmdBuf.beginRenderPass({
      label: DepthPyramidDebugDrawPass.NAME,
      colorAttachments: [
        useColorAttachment(screenTexture, getClearColorVec3()),
      ],
      timestampWrites: profiler?.createScopeGpu(DepthPyramidDebugDrawPass.NAME),
    });

    const bindings = this.bindingsCache.getBindings(depthTexture.label, () =>
      this.createBindings(ctx)
    );
    renderPass.setBindGroup(0, bindings);
    renderPass.setPipeline(this.renderPipeline);
    renderPass.draw(3);
    renderPass.end();
  }

  private createBindings = ({
    device,
    globalUniforms,
    prevFrameDepthPyramidTexture,
  }: PassCtx): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

    return assignResourcesToBindings2(
      DepthPyramidDebugDrawPass,
      '000',
      device,
      this.renderPipeline,
      [
        globalUniforms.createBindingDesc(b.renderUniforms),
        {
          binding: b.depthPyramidTexture,
          resource: prevFrameDepthPyramidTexture,
        },
      ]
    );
  };
}
