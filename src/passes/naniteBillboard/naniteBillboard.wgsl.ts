import { SHADER_SNIPPET_INSTANCES_CULL_PARAMS } from '../cullInstances/cullInstancesBuffer.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SHADER_SNIPPET_BILLBOARD_ARRAY } from './naniteBillboardsBuffer.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    instancesTransforms: 1,
    wholeObjectCullData: 2,
    billboardsIdsResult: 3,
    diffuseTexture: 4,
    sampler: 5,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}

// for bounding sphere
${SHADER_SNIPPET_INSTANCES_CULL_PARAMS(b.wholeObjectCullData, 'read')}

// instance transforms
@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

// billboard: array with results
${SHADER_SNIPPET_BILLBOARD_ARRAY(b.billboardsIdsResult, 'read')}

@group(0) @binding(${b.diffuseTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${b.sampler})
var _sampler: sampler;

const BILLBOARD_VERTICES = array<vec2<f32>, 6>(
  vec2<f32>(-1.0, -1.0),
  vec2<f32>(-1.0, 1.0),
  vec2<f32>(1.0, -1.0),
  vec2<f32>(1.0, 1.0),
  vec2<f32>(-1.0, 1.0),
  vec2<f32>(1.0, -1.0),
);

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) wsPosition: vec4f,
  @location(1) uv: vec2f,
};

@vertex
fn main_vs(
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;
  let quadOffset = BILLBOARD_VERTICES[inVertexIndex];
  let tfxIdx = _billboardIdsArray[inInstanceIndex];
  let modelMat = _instanceTransforms[tfxIdx];
  
  let boundingSphere = _cullParams.objectBoundingSphere;
  let r = boundingSphere.w;
  let viewMat = _uniforms.viewMatrix;
  let projMat = _uniforms.projMatrix;
  
  // center -> view, then move corners in view space by radius, then project
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let cornerVS = vec4f(center.xy + r * quadOffset, center.z, 1.);

  result.position = projMat * cornerVS;
  result.uv = (quadOffset.xy + 1.0) / 2.0;

  // DEBUG in world space:
  // var center = modelMat * vec4f(boundingSphere.xyz, 1.);
  // center.x = center.x + quadOffset.x * r;
  // center.y = center.y + quadOffset.y * r;
  // let cornerVS = viewMat * center;

  return result;
}


@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec4<f32> {
  var c = vec3f(fragIn.uv.x, fragIn.uv.y, 0.);
  let impostorDiff = textureSample(_diffuseTexture, _sampler, fragIn.uv).rgb;
  c = impostorDiff;
  return vec4(c, 1.0);
}
`;
