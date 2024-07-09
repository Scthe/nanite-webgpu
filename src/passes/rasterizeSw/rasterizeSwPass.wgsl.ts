import { BUFFER_INDEX_BUFFER } from '../../scene/naniteBuffers/index.ts';
import { BUFFER_INSTANCES } from '../../scene/naniteBuffers/instancesBuffer.ts';
import { BUFFER_MESHLET_DATA } from '../../scene/naniteBuffers/meshletsDataBuffer.ts';
import { BUFFER_VERTEX_POSITIONS } from '../../scene/naniteBuffers/vertexPositionsBuffer.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { LINEAR_DEPTH } from '../_shaderSnippets/linearDepth.wgsl.ts';
import { BUFFER_VERTEX_NORMALS } from '../../scene/naniteBuffers/vertexNormalsBuffer.ts';
import {
  BUFFER_DRAWN_MESHLETS_SW_PARAMS,
  BUFFER_DRAWN_MESHLETS_LIST,
} from '../../scene/naniteBuffers/drawnMeshletsBuffer.ts';

/*
https://fgiesen.wordpress.com/2013/02/10/optimizing-the-basic-rasterizer/
https://www.scratchapixel.com/lessons/3d-basic-rendering/rasterization-practical-implementation/rasterization-stage.html
https://jtsorlinis.github.io/rendering-tutorial/

UE5
- https://github.com/EpicGames/UnrealEngine/blob/c830445187784f1269f43b56f095493a27d5a636/Engine/Source/Developer/NaniteUtilities/Public/Rasterizer.h#L117
- https://github.com/EpicGames/UnrealEngine/blob/c830445187784f1269f43b56f095493a27d5a636/Engine/Shaders/Private/Nanite/NaniteRasterizer.ush#L221

Other possible features:
- supersampling 
- transparency from textures. It actually has to mix the pixel behind. But we do not know the pixel behind.
*/

export const SHADER_PARAMS = {
  workgroupSizeX: 32, // TODO [LOW] set better value
  maxWorkgroupsY: 1 << 15, // Spec says limit is 65535 (2^16 - 1), so we use 32768
  bindings: {
    renderUniforms: 0,
    resultBuffer: 1,
    vertexPositions: 2,
    indexBuffer: 3,
    meshletsData: 4,
    drawnMeshletIds: 5,
    drawnMeshletParams: 6,
    instancesTransforms: 7,
    vertexNormals: 8,
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

${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.UTILS}
${SHADER_SNIPPETS.NORMALS_UTILS}
${LINEAR_DEPTH}

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${BUFFER_MESHLET_DATA(b.meshletsData)}
${BUFFER_DRAWN_MESHLETS_SW_PARAMS(b.drawnMeshletParams, 'read')}
${BUFFER_DRAWN_MESHLETS_LIST(b.drawnMeshletIds, 'read')}
${BUFFER_VERTEX_POSITIONS(b.vertexPositions)}
${BUFFER_VERTEX_NORMALS(b.vertexNormals)}
${BUFFER_INDEX_BUFFER(b.indexBuffer)}
${BUFFER_INSTANCES(b.instancesTransforms)}
${BUFFER_SOFTWARE_RASTERIZER_RESULT(b.resultBuffer, 'read_write')}

// test colors in ABGR
const COLOR_RED: u32 = 0xff0000ffu;
const COLOR_GREEN: u32 = 0xff00ff00u;
const COLOR_BLUE: u32 = 0xffff0000u;
const COLOR_TEAL: u32 = 0xffffff00u;
const COLOR_PINK: u32 = 0xffff00ffu;
const COLOR_YELLOW: u32 = 0xff00ffffu;

@compute
@workgroup_size(${c.workgroupSizeX}, 1, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // x - triangle id inside meshlet, always 0-124. You might have to discard
  // y - entry index into drawn meshlets SW list
  // z - 1

  let viewportSize: vec2f = _uniforms.viewport.xy;
  let viewMatrix = _uniforms.viewMatrix;
  let projMatrix = _uniforms.projMatrix;

  let triangleIdx: u32 = global_id.x;

  // prepare iters
  let drawnMeshletCnt: u32 = _drawnMeshletsSwParams.actuallyDrawnMeshlets;
  let iterCount: u32 = ceilDivideU32(drawnMeshletCnt, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;

  for(var i: u32 = 0u; i < iterCount; i++){
    let iterOffset: u32 = tfxOffset + i;
    if (iterOffset >= drawnMeshletCnt) { continue; }

    // get meshlet
    let drawData: vec2u = _getMeshletSoftwareDraw(iterOffset); // .x - transfromIdx, .y - meshletIdx
    let meshlet = _meshlets[drawData.y];
    if (triangleIdx >= meshlet.triangleCount) { continue; }

    // get tfx
    let modelMat = _getInstanceTransform(drawData.x);
    let mvpMat = getMVP_Mat(modelMat, viewMatrix, projMatrix);

    // draw
    let indexOffset = meshlet.firstIndexOffset;
    rasterize(
      modelMat,
      mvpMat,
      viewportSize,
      indexOffset,
      triangleIdx
    );
  } 
}

fn rasterize(
  modelMat: mat4x4f,
  mvpMat: mat4x4f,
  viewportSizeF32: vec2f,
  indexOffset: u32,
  triangleIdx: u32
) {
  let viewportSize = vec2u(viewportSizeF32);

  let idx0 = _indexBuffer[indexOffset + triangleIdx * 3u];
  let idx1 = _indexBuffer[indexOffset + triangleIdx * 3u + 1u]; // swap idx1 and idx2 for CCW
  let idx2 = _indexBuffer[indexOffset + triangleIdx * 3u + 2u];
  let vertexPos0 = _getVertexPosition(idx0); // assumes .w=1
  let vertexPos1 = _getVertexPosition(idx1); // assumes .w=1
  let vertexPos2 = _getVertexPosition(idx2); // assumes .w=1
  let v0_NDC: vec3f = projectVertex(mvpMat, vertexPos0);
  let v1_NDC: vec3f = projectVertex(mvpMat, vertexPos1);
  let v2_NDC: vec3f = projectVertex(mvpMat, vertexPos2);
  let v0: vec2f = ndc2viewportPx(viewportSizeF32.xy, v0_NDC); // in pixels
  let v1: vec2f = ndc2viewportPx(viewportSizeF32.xy, v1_NDC); // in pixels
  let v2: vec2f = ndc2viewportPx(viewportSizeF32.xy, v2_NDC); // in pixels
  // storeResult(viewportSize, vec2u(v0.xy), COLOR_RED); // dbg
  // storeResult(viewportSize, vec2u(v1.xy), COLOR_GREEN); // dbg
  // storeResult(viewportSize, vec2u(v2.xy), COLOR_BLUE); // dbg
  let vertexN0 = _getVertexNormal(idx0);
  let vertexN1 = _getVertexNormal(idx1);
  let vertexN2 = _getVertexNormal(idx2);
  let n0 = transformNormalToWorldSpace(modelMat, vertexN0);
  let n1 = transformNormalToWorldSpace(modelMat, vertexN1);
  let n2 = transformNormalToWorldSpace(modelMat, vertexN2);
  
  // backface culling - CCW is OK, CW fails
  let triangleArea = -edgeFunction(v0, v1, v2); // negative cause CCW is default in WebGPU
  if (triangleArea < 0.) { return; }
  // NOTE: to handle CW, just swap v1 and v2

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

  // check if triangle covers only 1 pixel. It would do 0 iters.
  // But most code (incl. UE5) ignore this case?
  /*if(boundRectMin.x == boundRectMax.x && boundRectMin.y == boundRectMax.y) {
    let depth: f32 = (v0_NDC.z + v1_NDC.z + v2_NDC.z) / 3.0; // ?
    let n: vec3f = normalize(n0 + n1 + n2); // [-1, 1] // ?
    let value = createPayload(depth, n);
    storeResult(viewportSize, vec2u(u32(boundRectMin.x), u32(boundRectMin.y)), value);
  }*/

  // NOTE: You can easily optimize this to just 3 adds per fragment. I've copied
  // the first snippet from the tutorials at the top of the file. Feel free
  // to copy the second snippet yourself. edgeFunction() is the most intuitive
  // implementation available and it's still much faster than the hardware.
  
  // iterate row-by-row
  for (var y: f32 = boundRectMin.y; y < boundRectMax.y; y+=1.0) {

    // iterate columns
    for (var x: f32 = boundRectMin.x; x < boundRectMax.x; x+=1.0) {
      let p = vec2f(x, y);

      // barycentric coordinates
      let C0 = edgeFunction(v2, v1, p) / triangleArea; // for vertex 0
      let C1 = edgeFunction(v0, v2, p) / triangleArea; // for vertex 1
      let C2 = edgeFunction(v1, v0, p) / triangleArea; // for vertex 2

      if (C0 >= 0 && C1 >= 0 && C2 >= 0) {
        // let value = COLOR_TEAL;
        // let value = debugBarycentric(C0, C1, C2);
        
        let depth: f32 = v0_NDC.z * C0 + v1_NDC.z * C1 + v2_NDC.z * C2;
        let n: vec3f = normalize(n0 * C0 + n1 * C1 + n2 * C2); // [-1, 1]
        
        let value = createPayload(depth, n);
        storeResult(viewportSize, vec2u(u32(x), u32(y)), value);
      }
    }
  }
}

fn edgeFunction(v0: vec2f, v1: vec2f, p: vec2f) -> f32 {
  return (p.x - v0.x) * (v1.y - v0.y) - (p.y - v0.y) * (v1.x - v0.x);
}

const U16_MAX: f32 = 65535.0;

fn createPayload(depth0: f32, n: vec3f) -> u32 {
  // TODO [IGNORE] We could also store color data in 565 format instead of normals.
  //      But HDR would wreck us. So tonemap here (and also in hw rasterizer)?
  //      Feels like crap.

  // encode depth in 16bits
  // let depth = linearizeDepth_0_1(depth0); // debug, otherwise non-linear depth is not visible
  let depth = 1.0 - depth0; // reverse so we can take max instead of min. The buffer clear set all values to 0, so can't use min
  let depthU16 = clamp(depth * U16_MAX, 0., U16_MAX - 1); // depth in range fit for u16

  // encode normals. We could use pack4x8snorm(), but too lazy to debug
  // let n_0_1 = n * 0.5 + 0.5; // [0-1] // VERSION 0: NO OCT. ENCODED, XY ONLY
  let n_0_1 = encodeOctahedronNormal(n); // this has some edge cases, but as entire thing is a hack around lack of atomic<u64>, I do not care
  let nPacked: u32 = (
    (u32(n_0_1.x * 255) << 8) |
     u32(n_0_1.y * 255)
  );

  return (u32(depthU16) << 16) | nPacked;
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

fn projectVertex(mvpMat:mat4x4f, pos: vec4f) -> vec3f {
  let posClip = mvpMat * pos;
  let posNDC = posClip / posClip.w;
  return posNDC.xyz;
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
  // WebGPU clears to 0. So atomicMin is pointless..
  atomicMax(&_softwareRasterizerResult[idx], value);
}
`;
