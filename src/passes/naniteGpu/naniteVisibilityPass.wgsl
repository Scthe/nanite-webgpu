/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(__BINDINGS_DRAW_INDIRECT_PARAMS)
var<storage, read_write> _drawIndirectResult: DrawIndirect;

@group(0) @binding(__BINDINGS_INSTANCES_TRANSFORMS)
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;


/** JS uses errorValue=Infnity when parent does not exist. I don't want to risk CPU->GPU transfer for inifinity, so I use ridiculous value */
const PARENT_ERROR_INFINITY: f32 = 99990.0f;


@compute
@workgroup_size(__WORKGROUP_SIZE_X, 1, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  if (global_id.x == 0u) {
    // We always draw 'MAX_MESHLET_TRIANGLES * VERTS_PER_TRIANGLE(3)' verts. Draw pass will discard if the meshlet has less.
    _drawIndirectResult.vertexCount = __MAX_MESHLET_TRIANGLES * 3u;
    _drawIndirectResult.firstVertex = 0u;
    _drawIndirectResult.firstInstance = 0u;
  }
  if (global_id.x >= arrayLength(&_meshlets)) {
    return;
  }

  let threshold = _uniforms.viewport.z;
  let screenHeight = _uniforms.viewport.y;
  let cotHalfFov = _uniforms.viewport.w;
  let meshletIdx: u32 = global_id.x;
  let meshlet = _meshlets[meshletIdx];
  let instanceCount: u32 = arrayLength(&_instanceTransforms);
  let iterCount: u32 = ceilDivideU32(instanceCount, __MAX_WORKGROUPS_Y);
  let tfxOffset: u32 = global_id.y * iterCount;

  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    let modelMat = _instanceTransforms[tfxIdx];
    if (!isInsideCameraFrustum(modelMat, meshlet)) {
      continue;
    }
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

    var isVisible = parentError > threshold && clusterError <= threshold;

    if (isVisible){
      // TODO Aggregate atomic writes. Though we don't do much iters usually, so..
      let idx = atomicAdd(&_drawIndirectResult.instanceCount, 1u);
      _drawnMeshletIds[idx] = vec2u(tfxIdx, meshletIdx);
    }
  }
}

fn isInsideCameraFrustum(
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  // check GUI flag
  if ((_uniforms.flags & 1) == 0){
    return true;
  }

  var center = vec4f(meshlet.boundsMidPointAndError.xyz, 1.);
  center = modelMat * center;
  let r = meshlet.boundingSphereRadius;
  let r0 = dot(center, _uniforms.cameraFrustumPlane0) <= r;
  let r1 = dot(center, _uniforms.cameraFrustumPlane1) <= r;
  let r2 = dot(center, _uniforms.cameraFrustumPlane2) <= r;
  let r3 = dot(center, _uniforms.cameraFrustumPlane3) <= r;
  let r4 = dot(center, _uniforms.cameraFrustumPlane4) <= r;
  let r5 = dot(center, _uniforms.cameraFrustumPlane5) <= r;
  return r0 && r1 && r2 && r3 && r4 && r5;
}


fn getProjectedError(
  mvpMatrix: mat4x4<f32>,
  screenHeight: f32,
  cotHalfFov: f32,
  boundsMidPointAndError: vec4f
) -> f32 {
  // return 1000.0 * boundsMidPointAndError.w; // used to debug tests, see calcs at the top of 'naniteVisibilityPass.test.ts'
  
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

fn ceilDivideU32(numerator: u32, denominator: u32) -> u32 {
  return (numerator + denominator - 1) / denominator;
}

  // START: DEBUG HARDCODE
  /*var boundsMidPointAndError = vec4f(0.,0.,0.,0.,);
  var parentBoundsMidPointAndError = vec4f(0.,0.,0.,0.,);
  boundsMidPointAndError.x = 0.;
  parentBoundsMidPointAndError.x = 0.;
  boundsMidPointAndError.y = 0.;
  parentBoundsMidPointAndError.y = 0.;
  boundsMidPointAndError.z = -1.2;
  parentBoundsMidPointAndError.z = -1.2;
  let gt = 0.002; let lt = 0.001; let inf = 999999.0;
  if (global_id.x == 1u) {
    boundsMidPointAndError.w = gt;
    parentBoundsMidPointAndError.w = inf;
  }
  if (global_id.x == 2u) {
    boundsMidPointAndError.w = lt;
    parentBoundsMidPointAndError.w = inf;
  }
  if (global_id.x == 3u) {
    boundsMidPointAndError.w = lt;
    parentBoundsMidPointAndError.w = lt;
  }
  if (global_id.x == 4u) {
    boundsMidPointAndError.w = gt;
    parentBoundsMidPointAndError.w = gt;
  }
  if (global_id.x == 5u) {
    boundsMidPointAndError.w = lt;
    parentBoundsMidPointAndError.w = gt;
  }*/
  // END: DEBUG HARDCODE