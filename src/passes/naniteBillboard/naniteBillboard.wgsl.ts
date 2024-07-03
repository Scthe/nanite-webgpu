import { CONFIG, SHADING_MODE_NORMALS } from '../../constants.ts';
import { SNIPPET_DITHER } from '../_shaderSnippets/dither.wgsl.ts';
import { SNIPPET_PACKING } from '../_shaderSnippets/pack.wgsl.ts';
import { SHADER_SNIPPET_INSTANCES_CULL_PARAMS } from '../cullInstances/cullInstancesBuffer.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SHADER_SNIPPET_BILLBOARD_ARRAY } from './naniteBillboardsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { SNIPPET_SHADING_PBR } from '../_shaderSnippets/pbr.wgsl.ts';
import { SNIPPET_SHADING } from '../_shaderSnippets/shading.wgsl.ts';

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
${SNIPPET_DITHER}
${SNIPPET_PACKING}
${SHADER_SNIPPETS.NORMALS_UTILS}
${SNIPPET_SHADING_PBR}
${SNIPPET_SHADING}
${SHADER_SNIPPETS.FS_NORMAL_FROM_DERIVATIVES}

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
  @location(0) positionWS: vec4f,
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
  result.positionWS = modelMat * vec4f(boundingSphere.xyz, 1.); // TODO viewMatInv * cornerVS; would be better
  result.uv = (quadOffset.xy + 1.0) / 2.0;
  result.uv.y = 1.0 - result.uv.y;

  // calculate 2d angle (ignore Y-axis) between camera-to-object and where model is facing
  // used to calculate which impostor image to use
  let cameraPos = _uniforms.cameraPosition.xyz;
  let centerWS = (modelMat * vec4f(boundingSphere.xyz, 1.)).xyz;
  var camera2ModelDir: vec3f = cameraPos - centerWS;
  // var camera2ModelDir: vec3f = cameraPos; // mock
  var objectFrontDir: vec3f = (modelMat * vec4f(0., 0., 1., 0.)).xyz;
  // let objectFrontDir = vec3f(0., 0., 1.0); // mock
  result.facingAngleDgr = angleDgr_axisXZ(objectFrontDir, camera2ModelDir);

  return result;
}

/** https://math.stackexchange.com/questions/878785/how-to-find-an-angle-in-range0-360-between-2-vectors
 * 
 * Consult 'src\passes\naniteBillboard\mathPlayground.test.ts' before making any changes!
 */
fn angleDgr_axisXZ(vecA: vec3f, vecB: vec3f) -> f32 {
  let vecAn = normalize(vec2f(vecA.x, vecA.z));
  let vecBn = normalize(vec2f(vecB.x, vecB.z));
  let dot = vecAn.x * vecBn.x + vecAn.y * vecBn.y;
  let det = vecAn.x * vecBn.y - vecAn.y * vecBn.x;
  var dgr = degrees(atan2(det, dot));

  while (dgr < 0.0) { dgr += 360.0; }
  return dgr;
}


const IMPOSTOR_COUNT: u32 = ${CONFIG.impostors.views};
const IMPOSTOR_COUNT_INV: f32 = 1.0 / f32(${CONFIG.impostors.views});


struct ImpostorSample {
  diffuse: vec4f,
  normal: vec3f,
};

@fragment
fn main_fs(
  fragIn: VertexOutput
) -> @location(0) vec4<f32> {
  let delta = 360.0 * IMPOSTOR_COUNT_INV; // 30dgr
  let shownImageF32 = fragIn.facingAngleDgr / delta;
  // do blend between 2 consecutive billboard images. Not amazing, but..
  let shownImage0 = u32(floor(shownImageF32));
  let shownImage1 = u32(ceil(shownImageF32)); // to hipster to +1
  let impostor0 = impostorSample(shownImage0, fragIn.uv);
  let impostor1 = impostorSample(shownImage1, fragIn.uv);

  // mix factor between both images
  let ditherStr = getBillboardDitheringStrength(_uniforms.flags);
  let dither = getDitherForPixel(vec2u(fragIn.position.xy)); // range: 0-1
  let modStr = mix(fract(shownImageF32), dither, ditherStr);

  let shadingMode = getShadingMode(_uniforms.flags);
  var color: vec4f;

  if (shadingMode == ${SHADING_MODE_NORMALS}u) {
    // ignores impostor1, but it's just a debug mode so..
    color = vec4f(abs(impostor0.normal), impostor0.diffuse.a);
    
  } else {
    // shading
    var material: Material;
    createDefaultMaterial(&material, fragIn.positionWS);
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);

    // impostor 0
    material.normal = impostor0.normal;
    material.albedo = impostor0.diffuse.rgb;
    let c0 = doShading(material, AMBIENT_LIGHT, lights);
    // impostor 1
    material.normal = impostor1.normal;
    material.albedo = impostor1.diffuse.rgb;
    let c1 = doShading(material, AMBIENT_LIGHT, lights);

    // mix
    let a = mix(impostor0.diffuse.a, impostor1.diffuse.a, modStr);
    color = vec4f(mix(c0, c1, modStr), a);
  }

  if (color.a < 0.5) { discard; }
  return vec4(color.xyz, 1.0);
}


fn impostorSample(idx: u32, uv: vec2f) -> ImpostorSample {
  // e.g. for idx=4 and uv.x=0.7 turn into 4.7 and then divide by IMPOSTOR_COUNT
  let uvX = (f32(idx % IMPOSTOR_COUNT) + uv.x) * IMPOSTOR_COUNT_INV;
  let texValues = textureSample(_diffuseTexture, _sampler, vec2f(uvX, uv.y));

  var result: ImpostorSample;
  result.diffuse = unpackColor8888(texValues.r);
  result.normal = unpackNormal(texValues.g);
  return result;
}
`;
