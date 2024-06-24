import { CAMERA_CFG } from '../../constants.ts';
import { LINEAR_DEPTH } from './linearDepth.wgsl.ts';
import { CLAMP_TO_MIP_LEVELS } from './shaderSnippets.wgls.ts';

export const SNIPPET_OCCLUSION_CULLING = /* wgsl */ `

${CLAMP_TO_MIP_LEVELS}
${LINEAR_DEPTH}

/**
 * Everything closer than this will always pass the occlusion culling.
 * This fixes the AABB projection problems when sphere is near/intersecting zNear.
 * Most 'simple' sphere projection formulas just do not work in that case.
 * Technically we could test in view-space, smth like:
 *    'sphere.z < zNear && sphere.z + r > zNear'.
 * You will get flicker and instabilities.
 * 
 * Look, 1h ago I have rewritten bounding sphere radius calc and had 1e-9
 * differences to old approach. The math sometimes..
 * 
 * I DON'T HAVE TO DEAL WITH THIS.
 * 
 * Exact value choosen cause I say so.
 */
const CLOSE_RANGE_NEAR_CAMERA: f32 = 4.0;

/** 
 * https://www.youtube.com/live/Fj1E1A4CPCM?si=PJmBhKd_TQk1GMOb&t=2462 - triangles
 * https://www.youtube.com/watch?v=5sBpo5wKmEM - meshlets
*/
fn isPassingOcclusionCulling(
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f,
  dbgOverrideMipmapLevel: i32 // if >=0 then overrides mipmap level for debug
) -> bool {
  let viewportSize = _uniforms.viewport.xy;
  let viewMat = _uniforms.viewMatrix;
  let projMat = _uniforms.projMatrix;

  // project meshlet's center to view space
  // NOTE: view space is weird, e.g. .z is NEGATIVE!
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let r = boundingSphere.w;

  // if is close to near plane, it's always visible
  // abs cause view space is ???
  const zNear = ${CAMERA_CFG.near};
  // if (abs(center.z) < r + ${CAMERA_CFG.near}){
  // let distanceToNearPlane = abs(center.z) - zNear;
  // if (distanceToNearPlane < r){
  let closestPointZ = abs(center.z) - r;
  if (closestPointZ < zNear + CLOSE_RANGE_NEAR_CAMERA){
    return true;
  }

  // get AABB in view space
  let aabb = projectSphereView(projMat, center.xyz, r, viewportSize);
  // let aabb = getAABBfrom8ProjectedPoints(projMat, center.xyz, r);

  // calc pixel span at fullscreen
  let pixelSpanW = abs(aabb.z - aabb.x) * viewportSize.x;
  let pixelSpanH = abs(aabb.w - aabb.y) * viewportSize.y;
  let pixelSpan = max(pixelSpanW, pixelSpanH);
  // return pixelSpan > 100.;

  // Calc. mip level. If meshlet spans 50px, we round it to 64px and then sample log2(64) = 6 mip.
  // But, we calculated span in fullscreen, and pyramid level 0 is half. So add extra 1 level.
  var mipLevel = i32(ceil(log2(pixelSpan))); // i32 cause wgpu/deno
  if (dbgOverrideMipmapLevel >= 0) { mipLevel = dbgOverrideMipmapLevel; } // debug
  mipLevel = clampToMipLevels(mipLevel + 1, _depthPyramidTexture);
  // return mipLevel == 8; // 4 - far, 5/6 - far/mid, 8 - close

  // get the value from depth buffer (range: [0, 1]).
  // let mipSize = vec2f(textureDimensions(_depthPyramidTexture, mipLevel));
  // let samplePointAtMip = vec2u(aabb.xy * mipSize.xy);
  // let depthFromDepthBuffer = textureLoad(_depthPyramidTexture, samplePointAtMip, mipLevel).x;
  let depthFromDepthBuffer = textureSampleLevel(_depthPyramidTexture, _depthSampler, aabb.xy, f32(mipLevel)).x;
  // let depthFromDepthBuffer = 1.0;
  // return depthFromDepthBuffer == 1.0;

  /*
  // project the bounding sphere
  // PP[10 or 2|2] = -1.000100016593933
  // PP[14 or 3|2] = -0.010001000016927719
  let d = center.z - r; // INVESTIGATE: +/- to get closest?
  var depthMeshlet = (projMat[2][2] * d + projMat[3][2]) / -d; // in [0, 1]
  
  return depthMeshlet <= depthFromDepthBuffer;
  */
  let depthFromDepthBufferVS = linearizeDepth(depthFromDepthBuffer); // range [zNear .. zFar]
  return closestPointZ <= depthFromDepthBufferVS; // if there is any pixel that is closer than 'prepass-like' depth
}

/** project view-space AABB */
fn getAABBfrom8ProjectedPoints(projMat: mat4x4f, center: vec3f, r: f32) -> vec4f {
  let bb0 = getBB(projMat, center.xyz, r, vec3f( 1.,  1., 1.));
  let bb1 = getBB(projMat, center.xyz, r, vec3f(-1., -1., 1.));
  let bb2 = getBB(projMat, center.xyz, r, vec3f(-1.,  1., 1.));
  let bb3 = getBB(projMat, center.xyz, r, vec3f( 1., -1., 1.));
  //
  let bb4 = getBB(projMat, center.xyz, r, vec3f( 1.,  1., -1.));
  let bb5 = getBB(projMat, center.xyz, r, vec3f(-1., -1., -1.));
  let bb6 = getBB(projMat, center.xyz, r, vec3f(-1.,  1., -1.));
  let bb7 = getBB(projMat, center.xyz, r, vec3f( 1., -1., -1.));
  // aabb in [-1, 1]
  let aabbClip = vec4(
    min(min(min(bb0.x, bb1.x), min(bb2.x, bb3.x)), min(min(bb4.x, bb5.x), min(bb6.x, bb7.x))), // min x
    min(min(min(bb0.y, bb1.y), min(bb2.y, bb3.y)), min(min(bb4.y, bb5.y), min(bb6.y, bb7.y))), // min y
    max(max(max(bb0.x, bb1.x), max(bb2.x, bb3.x)), max(max(bb4.x, bb5.x), max(bb6.x, bb7.x))), // max x
    max(max(max(bb0.y, bb1.y), max(bb2.y, bb3.y)), max(max(bb4.y, bb5.y), max(bb6.y, bb7.y))), // max y
  );
  return (aabbClip + 1.0) * 0.5; // UV space
}

/** Calc in view space */
fn getBB(projMat: mat4x4f, center: vec3f, r: f32, dir: vec3f) -> vec4f {
  let p = center + r * dir;
  let pProj = projMat * vec4f(p, 1.);
  return pProj / pProj.w;
}

/**
 * https://github.com/zeux/niagara/blob/master/src/shaders/math.h#L2
 * https://zeux.io/2023/01/12/approximate-projected-bounds/
 * 2D Polyhedral Bounds of a Clipped, Perspective-Projected 3D Sphere. Michael Mara, Morgan McGuire. 2013
 * 
 * @param centerViewSpace sphere center (view space)
 * @param r radius
 */
fn projectSphereView(
  projMat: mat4x4f,
  centerViewSpace: vec3f,
  r: f32,
  viewportSize: vec2f,
) -> vec4f {
  let c = vec3f(centerViewSpace.xy, -centerViewSpace.z); // see camera.ts
  let cr = c * r;
  let czr2 = c.z * c.z - r * r;

  let vx = sqrt(c.x * c.x + czr2);
  let minX = (vx * c.x - cr.z) / (vx * c.z + cr.x);
  let maxX = (vx * c.x + cr.z) / (vx * c.z - cr.x);

  let vy = sqrt(c.y * c.y + czr2);
  let minY = (vy * c.y - cr.z) / (vy * c.z + cr.y);
  let maxY = (vy * c.y + cr.z) / (vy * c.z - cr.y);

  
  let P00 = projMat[0][0];
  let P11 = projMat[1][1];
  var aabb = vec4(minX * P00, minY * P11, maxX * P00, maxY * P11);
  // swizzle cause Y-axis is down. We will do abs() regardless. Then convert to [0, 1]
  return aabb.xwzy * vec4(0.5, -0.5, 0.5, -0.5) + vec4(0.5);
}
`;
