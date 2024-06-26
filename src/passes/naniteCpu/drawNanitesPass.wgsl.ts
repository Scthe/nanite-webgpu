import { SHADING_MODE_NORMALS } from '../../constants.ts';
import { SNIPPET_SHADING_PBR } from '../_shaderSnippets/pbr.wgsl.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { SNIPPET_SHADING } from '../_shaderSnippets/shading.wgsl.ts';
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
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${SHADER_SNIPPETS.FS_NORMAL_FROM_DERIVATIVES}
${SHADER_SNIPPETS.NORMALS_UTILS}
${SNIPPET_SHADING_PBR}
${SNIPPET_SHADING}

@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) normalWS: vec3f,
  @location(2) @interpolate(flat) instanceIdx: u32,
};


@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @location(1) inNormal : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  let modelMat = _instanceTransforms[inInstanceIndex];
  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix); // either here or upload from CPU
  let vertexPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = mvpMatrix * vertexPos;
  let positionWS = modelMat * vertexPos;
  result.position = projectedPosition;
  result.positionWS = positionWS;
  result.instanceIdx = inInstanceIndex;
  result.normalWS = transformNormalToWorldSpace(modelMat, inNormal);

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  // not enough data for most of debug modes
  let shadingMode = getShadingMode(_uniforms.flags);
  var color: vec3f;

  if (shadingMode == ${SHADING_MODE_NORMALS}u) {
    color = abs(normalize(fragIn.normalWS));
    
  } else {
    var material: Material;
    createDefaultMaterial(&material, fragIn.positionWS);
    material.normal = normalize(fragIn.normalWS);
    
    // shading
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);
    color = doShading(material, AMBIENT_LIGHT, lights);
  }

  return vec4(color.xyz, 1.0);
}
`;
