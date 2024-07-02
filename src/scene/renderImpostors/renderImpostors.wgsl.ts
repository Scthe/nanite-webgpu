import { FS_NORMAL_FROM_DERIVATIVES } from '../../passes/_shaderSnippets/shaderSnippets.wgls.ts';

export const SHADER_PARAMS = {
  bindings: {
    matrices: 0,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

@group(0) @binding(${b.matrices})
var<storage, read> _matrices: array<mat4x4<f32>>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
};

@vertex
fn main_vs(
  @location(0) positionWS: vec3f,
  // @builtin(vertex_index) in_vertex_index: u32
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  let projMat = _matrices[0];
  let viewMat = _matrices[1 + inInstanceIndex];
  // let viewMat = _matrices[2];
  let positionWS_4 = vec4f(positionWS.xyz, 1.0);
  let positionProj = projMat * viewMat * positionWS_4;
  
  var result: VertexOutput;
  result.position = vec4<f32>(positionProj.xyz, 1.0);
  result.positionWS = positionWS_4;
  return result;
}

${FS_NORMAL_FROM_DERIVATIVES}

@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec4<f32> {
  let normal = normalFromDerivatives(fragIn.positionWS);
  return vec4<f32>(abs(normal.xyz), 1.0);
}
`;
