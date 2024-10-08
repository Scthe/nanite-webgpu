import { SNIPPET_PACKING } from '../../passes/_shaderSnippets/pack.wgsl.ts';
import { FS_NORMAL_FROM_DERIVATIVES } from '../../passes/_shaderSnippets/shaderSnippets.wgls.ts';

export const SHADER_PARAMS = {
  bindings: {
    matrices: 0,
    diffuseTexture: 1,
    sampler: 2,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

@group(0) @binding(${b.matrices})
var<storage, read> _matrices: array<mat4x4<f32>>;

@group(0) @binding(${b.diffuseTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${b.sampler})
var _sampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) normalWS: vec3f,
  @location(2) uv: vec2f,
};

@vertex
fn main_vs(
  @location(0) positionWS: vec3f,
  @location(1) inNormal : vec3f,
  @location(2) inUV : vec2f,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  // NOTE: we render the model as-is, so no model matrix.
  let projMat = _matrices[0];
  let viewMat = _matrices[1 + inInstanceIndex];
  let positionWS_4 = vec4f(positionWS.xyz, 1.0);
  let positionProj = projMat * viewMat * positionWS_4;
  
  var result: VertexOutput;
  result.position = positionProj;
  result.positionWS = positionWS_4;
  result.normalWS = inNormal;
  result.uv = inUV;
  return result;
}

${FS_NORMAL_FROM_DERIVATIVES}
${SNIPPET_PACKING}

@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec2f {
  let c = textureSample(_diffuseTexture, _sampler, fragIn.uv).rgb;
  // TODO [IGNORE] store diffuse texture's alpha instead of override with 1.0

  let normalWS = normalize(fragIn.normalWS.xyz);
  return vec2f(
    packColor8888(vec4f(c.rgb, 1.0)),
    packNormal(vec4f(normalWS, 0.0))
  );
}
`;
