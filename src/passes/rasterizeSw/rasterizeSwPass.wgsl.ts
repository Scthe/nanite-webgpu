import { BUFFER_INDEX_BUFFER } from '../../scene/naniteBuffers/index.ts';
import { BUFFER_VERTEX_POSITIONS } from '../../scene/naniteBuffers/vertexPositionsBuffer.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';

/*
https://fgiesen.wordpress.com/2013/02/10/optimizing-the-basic-rasterizer/
https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/rasterization-stage.html
https://jtsorlinis.github.io/rendering-tutorial/

UE5
- https://github.com/EpicGames/UnrealEngine/blob/c830445187784f1269f43b56f095493a27d5a636/Engine/Source/Developer/NaniteUtilities/Public/Rasterizer.h#L117
- https://github.com/EpicGames/UnrealEngine/blob/c830445187784f1269f43b56f095493a27d5a636/Engine/Shaders/Private/Nanite/NaniteRasterizer.ush#L221
*/

export const SHADER_PARAMS = {
  workgroupSizeX: 1, // TODO set better value
  workgroupSizeY: 1, // TODO remove, hardcode as 1
  maxWorkgroupsY: 1 << 15, // Spec says limit is 65535 (2^16 - 1), so we use 32768
  bindings: {
    renderUniforms: 0,
    resultBuffer: 1,
    vertexPositions: 2,
    indexBuffer: 3,
  },
};

export const BUFFER_SOFTWARE_RASTERIZER_RESULT = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, ${access}> _softwareRasterizerResult: ${
  access === 'read_write' ? 'array<atomic<u32>>' : 'array<u32>'
};
`;

///////////////////////////
/// SHADER CODE
///////////////////////////
const c = SHADER_PARAMS;
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${BUFFER_VERTEX_POSITIONS(b.vertexPositions)}
${BUFFER_INDEX_BUFFER(b.indexBuffer)}
${BUFFER_SOFTWARE_RASTERIZER_RESULT(b.resultBuffer, 'read_write')}

const COLOR_RED: u32 = 0xff0000ffu;
const COLOR_GREEN: u32 = 0xff00ff00u;
const COLOR_BLUE: u32 = 0xffff0000u;
const COLOR_TEAL: u32 = 0xffffff00u;
const COLOR_PINK: u32 = 0xffff00ffu;
const COLOR_YELLOW: u32 = 0xff00ffffu;

@compute
@workgroup_size(${c.workgroupSizeX}, ${c.workgroupSizeY}, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // x - triangle id inside meshlet, always 0-124. You might have to discard
  // y - entry index into drawn meshlets SW list
  // z - 1

  let viewportSize: vec2f = _uniforms.viewport.xy;
  // storeResult(viewportSize, global_id.xy, 0x8fff0000u); // ABGR

  let triangleIdx = global_id.x;
  rasterize(viewportSize, triangleIdx);
}

fn rasterize(
  viewportSizeF32: vec2f,
  triangleIdx: u32
) {
  let viewportSize = vec2u(viewportSizeF32);

  // TODO bounds check
  let idx0 = _indexBuffer[triangleIdx * 3u];
  let idx1 = _indexBuffer[triangleIdx * 3u + 1u]; // swap idx1 and idx2 for CCW
  let idx2 = _indexBuffer[triangleIdx * 3u + 2u];
  let vertexPos0 = _getVertexPosition(idx0); // assumes .w=1
  let vertexPos1 = _getVertexPosition(idx1); // assumes .w=1
  let vertexPos2 = _getVertexPosition(idx2); // assumes .w=1
  let v0_NDC: vec3f = projectVertex(vertexPos0);
  let v1_NDC: vec3f = projectVertex(vertexPos1);
  let v2_NDC: vec3f = projectVertex(vertexPos2);
  let v0: vec2f = ndc2viewportPx(viewportSizeF32.xy, v0_NDC); // in pixels
  let v1: vec2f = ndc2viewportPx(viewportSizeF32.xy, v1_NDC); // in pixels
  let v2: vec2f = ndc2viewportPx(viewportSizeF32.xy, v2_NDC); // in pixels
  // TODO [IGNORE?] following should also affect result just in case
  // storeResult(viewportSize, vec2u(v0.xy), COLOR_RED); // dbg
  // storeResult(viewportSize, vec2u(v1.xy), COLOR_GREEN); // dbg
  // storeResult(viewportSize, vec2u(v2.xy), COLOR_BLUE); // dbg
  
  // backface culling - CW is OK, CCW fails
  let triangleArea = edgeFunction(v0, v1, v2);
  if (triangleArea < 0.) { return; }

  // get bounding box XY points. All values in pixels as f32
  // MAX: top right on screen, but remember Y is inverted!
  var boundRectMax: vec2f = ceil(max(max(v0, v1), v2));
  // MIN: bottom left on screen, but remember Y is inverted!
  var boundRectMin: vec2f = floor(min(min(v0, v1), v2));
  // scissor
  boundRectMax = min(boundRectMax, viewportSizeF32.xy);
  boundRectMin = max(boundRectMin, vec2f(0.0, 0.0));
  // storeResult(viewportSize, vec2u(boundRectMax), COLOR_PINK); // dbg
  // storeResult(viewportSize, vec2u(boundRectMin), COLOR_PINK); // dbg
  
  // iterate row-by-row
  for (var y: f32 = boundRectMin.y; y < boundRectMax.y; y+=1.0) {

    // iterate columns
    for (var x: f32 = boundRectMin.x; x < boundRectMax.x; x+=1.0) {
      let p = vec2f(x, y);

      // barycentric coordinates
      let C0 = edgeFunction(v1, v2, p) / triangleArea; // for vertex 0
      let C1 = edgeFunction(v2, v0, p) / triangleArea; // for vertex 1
      let C2 = edgeFunction(v0, v1, p) / triangleArea; // for vertex 2

      if (C0 >= 0 && C1 >= 0 && C2 >= 0) {
        // let value = COLOR_TEAL;
        let value = debugBarycentric(C0, C1, C2);
        storeResult(viewportSize, vec2u(u32(x), u32(y)), value);
      }
    }
  }
}

fn edgeFunction(v0: vec2f, v1: vec2f, p: vec2f) -> f32 {
  return (p.x - v0.x) * (v1.y - v0.y) - (p.y - v0.y) * (v1.x - v0.x);
}

fn debugBarycentric(C0: f32, C1: f32, C2: f32) -> u32 {
  let color0: u32 = u32(C0 * 255); // 0-255 as u32
  let color1: u32 = u32(C1 * 255); // 0-255 as u32
  let color2: u32 = u32(C2 * 255); // 0-255 as u32
  return (0xff000000u | // alpha
     color0 | // red
    (color1 << 8) | // green
    (color2 << 16) // blue
  );
}

fn projectVertex(pos: vec4f) -> vec3f {
  // TODO multiply by MVP, do perspective divide
  // return vec3f(pos.xy * 0.5 + 0.5, pos.z); // to [0-1]
  return pos.xyz;
}

fn ndc2viewportPx(viewportSize: vec2f, pos: vec3f) -> vec2f {
  let pos_0_1 = pos.xy * 0.5 + 0.5; // to [0-1]
  return pos_0_1 * viewportSize.xy;
}

/** NOTE: if you want to store color for .png file, it's in ABGR format */
fn storeResult(viewportSize: vec2u, posPx: vec2u, value: u32) {
  // bitcast<u32>(value); <- if needed
  if(
    posPx.x < 0 || posPx.x >= viewportSize.x ||
    posPx.y < 0 || posPx.y >= viewportSize.y
  ) {
    return;
  }
  let y = viewportSize.y - posPx.y; // invert cause WebGPU coordinates
  let idx: u32 = y * viewportSize.x + posPx.x;
  atomicStore(&_softwareRasterizerResult[idx], value);
}
`;
