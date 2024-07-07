import { FULLSCREEN_TRIANGLE_POSITION } from '../_shaderSnippets/fullscreenTriangle.wgsl.ts';
import { BUFFER_SOFTWARE_RASTERIZER_RESULT } from '../rasterizeSw/rasterizeSwPass.wgsl.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

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

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${BUFFER_SOFTWARE_RASTERIZER_RESULT(b.softwareRasterizerResult, 'read')}


@vertex
fn main_vs(
  @builtin(vertex_index) VertexIndex : u32
) -> @builtin(position) vec4f {
  return getFullscreenTrianglePosition(VertexIndex);
}


@fragment
fn main_fs(
  @builtin(position) positionPxF32: vec4<f32>
) -> @location(0) vec4<f32> {
  let fragPositionPx = vec2u(positionPxF32.xy);
  // var colorHw = textureLoad(_textureHDR, fragPositionPx, 0).rgb;
  var color = vec4f(0., 0., 0., 0.,);

  // sample software rasterizer
  let viewportSize: vec2f = _uniforms.viewport.xy;
  // let yInv = viewportSize.y - positionPxF32.y;
  let swRasterizerIdx: u32 = u32(positionPxF32.y) * u32(viewportSize.x) + u32(positionPxF32.x);
  let swRasterizerResU32: u32 = _softwareRasterizerResult[swRasterizerIdx];
  let swRasterizerRes: vec4f = unpack4x8unorm(swRasterizerResU32);

  if (swRasterizerResU32 > 0u){
    // textureStore(_textureHDR, fragPositionPx, colorSw);
    color = vec4f(swRasterizerRes.rgb, 1.0);
  }

  return color;
}

`;
