import {
  FULLSCREEN_TRIANGLE_POSITION,
  cmdDrawFullscreenTriangle,
} from '../_shaderSnippets/fullscreenTriangle.wgsl.ts';
import { LINEAR_DEPTH } from '../_shaderSnippets/linearDepth.wgsl.ts';
import { CLAMP_TO_MIP_LEVELS } from '../_shaderSnippets/shaderSnippets.wgls.ts';
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
${FULLSCREEN_TRIANGLE_POSITION}
${LINEAR_DEPTH}

@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}


@fragment
fn main_fs(
  // this is not uv, this in pixels
  @builtin(position) coord: vec4<f32>
) -> @location(0) vec4<f32> {
  let viewportSize = vec2f(_uniforms.viewport.x, _uniforms.viewport.y);
  var mipLevel: i32 = getDbgPyramidMipmapLevel(_uniforms.flags);
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
    cmdDrawFullscreenTriangle(renderPass);
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
