import { FULLSCREEN_TRIANGLE_POSITION } from '../_shaderSnippets/fullscreenTriangle.wgsl.ts';
import { BUFFER_SOFTWARE_RASTERIZER_RESULT } from '../rasterizeSw/rasterizeSwPass.wgsl.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SNIPPET_SHADING_PBR } from '../_shaderSnippets/pbr.wgsl.ts';
import { SNIPPET_SHADING } from '../_shaderSnippets/shading.wgsl.ts';
import { SHADING_MODE_NORMALS } from '../../constants.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    softwareRasterizerResult: 1,
  },
};

///////////////////////////
/// SHADER CODE
/// I wish I could use compute pass, but WGSL has.. problems
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${FULLSCREEN_TRIANGLE_POSITION}
${SHADER_SNIPPETS.NORMALS_UTILS}
${SHADER_SNIPPETS.FS_NORMAL_FROM_DERIVATIVES}
${SNIPPET_SHADING_PBR}
${SNIPPET_SHADING}

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${BUFFER_SOFTWARE_RASTERIZER_RESULT(b.softwareRasterizerResult, 'read')}


@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}

struct FragmentOutput {
  @builtin(frag_depth) fragDepth: f32,
  @location(0) color: vec4<f32>,
};

@fragment
fn main_fs(
  @builtin(position) positionPxF32: vec4<f32>
) -> FragmentOutput {
  var result: FragmentOutput;

  let fragPositionPx = vec2u(positionPxF32.xy);
  // var colorHw = textureLoad(_textureHDR, fragPositionPx, 0).rgb;
  // var color = vec4f(0., 0., 0., 0.,);

  // sample software rasterizer
  let viewportSize: vec2f = _uniforms.viewport.xy;
  // let yInv = viewportSize.y - positionPxF32.y;
  let swRasterizerIdx: u32 = u32(positionPxF32.y) * u32(viewportSize.x) + u32(positionPxF32.x);
  let swRasterizerResU32: u32 = _softwareRasterizerResult[swRasterizerIdx];
  // let swRasterizerRes: vec4f = unpack4x8unorm(swRasterizerResU32);

  if (swRasterizerResU32 == 0u){
    // no pixel for software rasterizer, do not override.
    // 0 is the value we cleared the buffer to, so any write with atomicMax()
    // would affect the result. And it's not possible to try to write 0
    // given what software rasterizer stores. E.g. if depth bits were
    // 0, then the point would be on near plane, which is no AS terrible to cull.
    // Oct. encoded normal would also have to be 0, and there would have to be
    // no pixels directly behind that one (cause atomicMax would used them instead).
    discard;
  }

  // color = vec4f(swRasterizerRes.rgb, 1.0);
  
  // decode depth
  let swRasterDepth: u32 = swRasterizerResU32 >> 16;
  let swRasterDepthF32: f32 = 1.0 - f32(swRasterDepth) / 65535.0;
  // Not writing depth here would REALLY screws us in next frame occlusion culling
  result.fragDepth = swRasterDepthF32; // this pass has depth test ON!
  // result.color = vec4f(swRasterDepthF32, swRasterDepthF32, swRasterDepthF32, 1.0); // dbg

  // decode normal
  let nx = f32((swRasterizerResU32 >> 8) & 0xff) / 255.0; // [0, 1]
  let ny = f32(swRasterizerResU32 & 0xff) / 255.0; // [0, 1]
  // let nUnpacked: vec3f = vec3f(vec2f(nx, ny) * 2.0 - 1.0, 0.0); // [-1 .. 1] // VERSION 0: NO OCT. ENCODED, XY ONLY
  let nUnpacked: vec3f = normalize(decodeOctahedronNormal(vec2f(nx, ny)));

  let shadingMode = getShadingMode(_uniforms.flags);
  
  if (shadingMode == ${SHADING_MODE_NORMALS}u) {
    result.color = vec4f(abs(nUnpacked.xyz), 1.0);
    // result.color = vec4f(nUnpacked.xyz, 1.0);
    // result.color = vec4f(-nUnpacked.xyz, 1.0);
    
  } else {
    // material
    var material: Material;
    let positionProj = vec4(
      (positionPxF32.x / viewportSize.x) * 2.0 - 1.0, // [-1, 1]
      (positionPxF32.y / viewportSize.y) * 2.0 - 1.0, // [-1, 1]
      swRasterDepthF32,
      1.0
    );
    var positionWs = _uniforms.vpMatrixInv * positionProj;
    positionWs = positionWs / positionWs.w;
    createDefaultMaterial(&material, positionWs);
    material.normal = nUnpacked;
    material.roughness = 0.0;

    // shading
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);
    result.color = vec4f(doShading(material, AMBIENT_LIGHT, lights), 1.0);
  }

  return result;
}

`;
