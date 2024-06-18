import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    instancesTransforms: 1,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}

@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) wsPosition: vec4f,
  @location(1) @interpolate(flat) instanceIndex: u32,
};


@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  let modelMat = _instanceTransforms[inInstanceIndex];
  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix); // either here or upload from CPU
  let worldPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = mvpMatrix * worldPos;
  // projectedPosition /= projectedPosition.w; // ?! Am I just getting old?
  result.position = projectedPosition;
  result.wsPosition = worldPos; // skips multiply with model matrix for non-world-space ligthing
  result.instanceIndex = inInstanceIndex;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let c = fakeLighting(fragIn.wsPosition);
  var color = getRandomColor(fragIn.instanceIndex);
  color = color * c;
  return vec4(color.xyz, 1.0);
}
`;
