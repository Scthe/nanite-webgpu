/** usual 8x8 Bayer matrix dithering */
export const SNIPPET_DITHER = /* wgsl */ `

const DITHER_ELEMENT_RANGE: f32 = 64.0;

/** No. of possible colors in u8 color value */
const DITHER_LINEAR_COLORSPACE_COLORS: f32 = 256.0;

const DITHER_MATRIX = array<u32, 64>(
  0, 32,  8, 40,  2, 34, 10, 42,
 48, 16, 56, 24, 50, 18, 58, 26,
 12, 44,  4, 36, 14, 46,  6, 38,
 60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43,  1, 33,  9, 41,
 51, 19, 59, 27, 49, 17, 57, 25,
 15, 47,  7, 39, 13, 45,  5, 37,
 63, 31, 55, 23, 61, 29, 53, 21
);

/** Returns 0-1 dithered value
 * @ Param gl_FragCoord - fragment coordinate (in pixels)
 */
fn getDitherForPixel(gl_FragCoord: vec2u) -> f32 {
  let pxPos = vec2u(
    gl_FragCoord.x % 8u,
    gl_FragCoord.y % 8u
  );
  let idx = pxPos.y * 8u + pxPos.x;
  let matValue = DITHER_MATRIX[idx] + 1u; // [1-64]
  return f32(matValue) / DITHER_ELEMENT_RANGE;
}

/**
 * Add some random value to each pixel,
 * hoping it would make it different than neighbours
 */
fn ditherColor (
  gl_FragCoord: vec2u,
  originalColor: vec3f,
  strength: f32
) -> vec3f {
  let ditherMod = getDitherForPixel(gl_FragCoord) * strength  / DITHER_LINEAR_COLORSPACE_COLORS;
  return originalColor + ditherMod;
}

`;
