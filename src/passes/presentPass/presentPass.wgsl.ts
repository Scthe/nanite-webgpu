import { SHADING_MODE_PBR } from '../../constants.ts';
import { SNIPPET_ACES } from '../_shaderSnippets/aces.wgsl.ts';
import { SNIPPET_DITHER } from '../_shaderSnippets/dither.wgsl.ts';
import { FULLSCREEN_TRIANGLE_POSITION } from '../_shaderSnippets/fullscreenTriangle.wgsl.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    textureSrc: 1,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${FULLSCREEN_TRIANGLE_POSITION}
${SNIPPET_DITHER}
${SNIPPET_ACES}

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}

@group(0) @binding(${b.textureSrc})
var _textureSrc: texture_2d<f32>;


@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}

fn doGamma (color: vec3f, gammaValue: f32) -> vec3f {
  return pow(color, vec3f(1.0 / gammaValue));
}

@fragment
fn main_fs(
  @builtin(position) positionPxF32: vec4<f32>
) -> @location(0) vec4<f32> {
  let fragPositionPx = vec2u(positionPxF32.xy);
  var color = textureLoad(_textureSrc, fragPositionPx, 0).rgb;
  
  let shadingMode = getShadingMode(_uniforms.flags);
  if (shadingMode == ${SHADING_MODE_PBR}u) {
    let gamma = _uniforms.colorMgmt.x;
    let exposure = _uniforms.colorMgmt.y;
    let ditherStr = _uniforms.colorMgmt.z;
  
    color = ditherColor(fragPositionPx, color, ditherStr);
    color = color * exposure;
    color = saturate(doACES_Tonemapping(color));
    color = doGamma(color, gamma);
  }

  return vec4(color.xyz, 1.0);
}

`;
