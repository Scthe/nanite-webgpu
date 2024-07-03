import { CONFIG } from '../../constants.ts';
import { SHADER_SNIPPET_INSTANCES_CULL_PARAMS } from '../cullInstances/cullInstancesBuffer.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SHADER_SNIPPET_BILLBOARD_ARRAY } from './naniteBillboardsBuffer.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    instancesTransforms: 1,
    wholeObjectCullData: 2,
    billboardsIdsResult: 3,
    impostorTexture: 4,
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

@group(0) @binding(${b.impostorTexture})
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
  @location(2) @interpolate(flat) facingAngleDgr: f32,
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
  
  // See './mathPlayground.test.ts' for test for math on this part
  // center -> view, then move corners in view space by radius, then project
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let cornerVS = vec4f(center.xy + r * quadOffset, center.z, 1.);
  // TODO modify .z to bring closer/FURTHER in view space? Further means occ. cull will be more conservative

  result.position = projMat * cornerVS;
  result.uv = (quadOffset.xy + 1.0) / 2.0;
  result.uv.y = 1.0 - result.uv.y;

  // TODO [NOW] finish, extract to util fn
  // var camera2ModelDir = -center;
  // var objectFrontDir = viewMat * modelMat * vec4f(0., 0., 1., 0.);
  let cameraPos = _uniforms.cameraPosition.xyz;
  // let bsWS = (modelMat * vec4f(boundingSphere.xyz, 1.)).xyz;
  // var camera2ModelDir: vec3f = cameraPos - bsWS; // TODO mock
  var camera2ModelDir: vec3f = cameraPos;
  camera2ModelDir.y = 0; // ignore up-down

  // var objectFrontDir: vec3f = (modelMat * vec4f(0., 0., 1., 0.)).xyz; // TODO .z=-1? .w=1?
  let objectFrontDir = vec3f(0., 0., 1.0); // TODO mock

  // let angleCos = dot(camera2ModelDir, objectFrontDir);
  // result.facingAngleDgr = rad2dgr(acos(angleCos)); // degrees(acos(angleCos))
  // result.facingAngleDgr = angleCos;
  // result.facingAngleDgr = 180.0;
  result.facingAngleDgr = angleDgr_axisXZ(objectFrontDir, camera2ModelDir);

  // DEBUG in world space:
  // var center = modelMat * vec4f(boundingSphere.xyz, 1.);
  // center.x = center.x + quadOffset.x * r;
  // center.y = center.y + quadOffset.y * r;
  // let cornerVS = viewMat * center;

  return result;
}

/** https://math.stackexchange.com/questions/878785/how-to-find-an-angle-in-range0-360-between-2-vectors
 * 
 * Consult 'src\passes\naniteBillboard\mathPlayground.test.ts' before making any changes!
 */
fn angleDgr_axisXZ(vecA: vec3f, vecB: vec3f) -> f32 {
  let vecAn = normalize(vec2f(vecA.x, vecA.z));
  let vecBn = normalize(vec2f(vecB.x, vecB.z));
  // let angleCos = dot(vecAn, vecBn);
  // let angleSin = length(cross(vecAn, vecBn));
  // var dgr = degrees(atan2(angleSin, angleCos));
  let dot = vecAn.x * vecBn.x + vecAn.y * vecBn.y;
  let det = vecAn.x * vecBn.y - vecAn.y * vecBn.x;
  var dgr = degrees(atan2(det, dot));

  while (dgr < 0.0) { dgr += 360.0; }
  return dgr;
}


const IMPOSTOR_COUNT: u32 = ${CONFIG.impostors.views};
const IMPOSTOR_COUNT_INV: f32 = 1.0 / f32(${CONFIG.impostors.views});


@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec4<f32> {
  // var c = vec3f(fragIn.uv.x, fragIn.uv.y, 0.); // test
  // TODO [NOW] finish: blend between 2 closest images, use dither?

  let delta = 360.0 * IMPOSTOR_COUNT_INV; // 30dgr
  let shownImageF32 = fragIn.facingAngleDgr / delta;
  let shownImage0 = u32(floor(shownImageF32));
  let impostorDiff = impostorSample(shownImage0, fragIn.uv);
  if (impostorDiff.a < 0.5) { discard; }

  var c = impostorDiff.rgb;
  return vec4(c, 1.0);
}

fn impostorSample(idx: u32, uv: vec2f) -> vec4f {
  // e.g. for idx=4 and uv.x=0.7 turn into 4.7 and then divide by IMPOSTOR_COUNT
  let uvX = (f32(idx % IMPOSTOR_COUNT) + uv.x) * IMPOSTOR_COUNT_INV;
  return textureSample(_diffuseTexture, _sampler, vec2f(uvX, uv.y));
}
`;
