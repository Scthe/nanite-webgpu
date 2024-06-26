const MAT4 = 'mat4x4<f32>';

/** I always forget the order. */
export const GET_MVP_MAT = /* wgsl */ `
fn getMVP_Mat(modelMat: ${MAT4}, viewMat: ${MAT4}, projMat: ${MAT4}) -> ${MAT4} {
  let a = viewMat * modelMat;
  return projMat * a;
}
`;

export const FS_NORMAL_FROM_DERIVATIVES = /* wgsl */ `
fn normalFromDerivatives(wsPosition: vec4f) -> vec3f{
  let posWsDx = dpdxFine(wsPosition);
  let posWsDy = dpdyFine(wsPosition);
  return normalize(cross(posWsDy.xyz, posWsDx.xyz));
}
`;

/** Object-space lighting. */
export const FS_FAKE_LIGHTING = /* wgsl */ `
fn fakeLighting(wsPosition: vec4f) -> f32{
  let AMBIENT_LIGHT = 0.1;
  let LIGHT_DIR = vec3(5., 5., 5.);

  let normal = normalFromDerivatives(wsPosition);
  let lightDir = normalize(LIGHT_DIR);
  let NdotL = max(0.0, dot(normal.xyz, lightDir));
  return mix(AMBIENT_LIGHT, 1.0, NdotL);
}
`;

/** Get random color based on index. Same index == same color every frame. */
export const GET_RANDOM_COLOR = /* wgsl */ `
const COLOR_COUNT = 14u;
const COLORS = array<vec3f, COLOR_COUNT>(
    vec3f(1., 1., 1.),
    vec3f(1., 0., 0.),
    vec3f(0., 1., 0.),
    vec3f(0., 0., 1.),
    vec3f(1., 1., 0.),
    vec3f(0., 1., 1.),
    vec3f(1., 0., 1.),

    vec3f(.5, .5, .5),
    vec3f(.5, 0., 0.),
    vec3f(.5, .5, 0.),
    vec3f(0., 0., .5),
    vec3f(.5, .5, 0.),
    vec3f(0., .5, .5),
    vec3f(.5, 0., .5),
);
fn getRandomColor(idx: u32) -> vec3f {
  /*let start = 2u; // color only subset, rest is default purple
  let end = start + 1u;
  if(
    idx < COLOR_COUNT * start ||
    idx > COLOR_COUNT * end
  ){
    return vec3f(.5, .2, 1.);
  }*/

  return COLORS[idx % COLOR_COUNT];
}
`;

export const CLAMP_TO_MIP_LEVELS = /* wgsl */ `
fn clampToMipLevels(v: i32, _texture: texture_2d<f32>) -> i32 {
  let mipLevels = textureNumLevels(_texture);
  return clamp(v, 0, i32(mipLevels - 1)); // 8 mip levels mean indices 0-7
}
`;

export const NORMALS_UTILS = /* wgsl */ `

// WARNING: This is true only when you do not have scale (only rotation and transpose).
// https://paroj.github.io/gltut/Illumination/Tut09%20Normal%20Transformation.html
fn transformNormalToWorldSpace(modelMat: mat4x4f, normalV: vec3f) -> vec3f {
  let normalMatrix = modelMat; // !
  let normalWS = normalMatrix * vec4f(normalV, 0.0);
  return normalize(normalWS.xyz);
}

/** https://knarkowicz.wordpress.com/2014/04/16/octahedron-normal-vector-encoding/ */
fn decodeOctahedronNormal(f_: vec2f) -> vec3f {
  let f = f_ * 2.0 - 1.0;
 
  // https://twitter.com/Stubbesaurus/status/937994790553227264
  var n = vec3f(f.x, f.y, 1.0 - abs(f.x) - abs(f.y));
  let t = saturate(-n.z);
  if (n.x >= 0.0){ n.x -= t; } else { n.x += t; }
  if (n.y >= 0.0){ n.y -= t; } else { n.y += t; }
  return normalize(n);
}
`;
