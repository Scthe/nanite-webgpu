import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) wsPosition: vec4f,
};

@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  var worldPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = _uniforms.vpMatrix * worldPos;
  projectedPosition /= projectedPosition.w;
  result.position = vec4<f32>(projectedPosition.xyz, 1.0);
  result.wsPosition = worldPos;

  return result;
}

@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let c = fakeLighting(fragIn.wsPosition);
  return vec4(c, c, c, 1.0);
}
`;
