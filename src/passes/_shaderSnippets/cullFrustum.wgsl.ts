export const SNIPPET_FRUSTUM_CULLING = /* wgsl */ `

fn isInsideCameraFrustum(
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  // check GUI flag
  if (!useFrustumCulling()){
    return true;
  }

  var center = vec4f(meshlet.ownBoundingSphere.xyz, 1.);
  center = modelMat * center;
  let r = meshlet.ownBoundingSphere.w;
  let r0 = dot(center, _uniforms.cameraFrustumPlane0) <= r;
  let r1 = dot(center, _uniforms.cameraFrustumPlane1) <= r;
  let r2 = dot(center, _uniforms.cameraFrustumPlane2) <= r;
  let r3 = dot(center, _uniforms.cameraFrustumPlane3) <= r; // TODO plane down is wrong? Right/bottom edge flickers
  let r4 = dot(center, _uniforms.cameraFrustumPlane4) <= r;
  let r5 = dot(center, _uniforms.cameraFrustumPlane5) <= r;
  return r0 && r1 && r2 && r3 && r4 && r5;
}
`;
