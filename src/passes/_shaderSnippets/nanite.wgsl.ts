export const SNIPPET_NANITE_LOD_CULLING = /* wgsl */ `

fn isCorrectNaniteLOD (
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  let flags = _uniforms.flags;

  let threshold = _uniforms.viewport.z;
  let screenHeight = _uniforms.viewport.y;
  let cotHalfFov = _uniforms.viewport.w;
  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);

  // getVisibilityStatus
  let clusterError = getProjectedError(
    mvpMatrix,
    screenHeight,
    cotHalfFov,
    meshlet.boundsMidPointAndError,
  );
  let parentError = getProjectedError(
    mvpMatrix,
    screenHeight,
    cotHalfFov,
    meshlet.parentBoundsMidPointAndError,
  );

  return parentError > threshold && clusterError <= threshold;
}


fn getProjectedError(
  mvpMatrix: mat4x4<f32>,
  screenHeight: f32,
  cotHalfFov: f32,
  boundsMidPointAndError: vec4f
) -> f32 {
  // return 1000.0 * boundsMidPointAndError.w; // used to debug tests, see calcs at the top of 'cullMeshletsPass.test.ts'
  
  let r = boundsMidPointAndError.w; // error
  
  // WARNING: .parentError is INFINITY at top level
  // This is implemented as GPU meshlet just having some absurd high value
  if (r >= PARENT_ERROR_INFINITY) {
    return PARENT_ERROR_INFINITY;
  }

  let center = mvpMatrix * vec4f(boundsMidPointAndError.xyz, 1.0f);
  let d2 = dot(center.xyz, center.xyz); // 
  let projectedR = (cotHalfFov * r) / sqrt(d2 - r * r);
  return (projectedR * screenHeight) / 2.0;
}
`;
