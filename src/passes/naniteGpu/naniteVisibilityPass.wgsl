// TODO in future: vec2f(tfxId, meshletId)
@group(0) @binding(2)
var<storage, read_write> _drawnMeshletIdsResult: array<u32>;

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>, // TODO reset between each object
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(3)
var<storage, read_write> _drawIndirectResult: DrawIndirect;

/*
@group(0) @binding(2)
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;
*/

/** JS uses errorValue=Infnity when parent does not exist. I don't want to risk CPU->GPU transfer for inifinity, so I use ridiculous value */
const PARENT_ERROR_INFINITY: f32 = 99990.0f;


@compute
@workgroup_size(1) // TODO?
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  if (global_id.x == 0u) {
    _drawIndirectResult.vertexCount = __MAX_MESHLET_TRIANGLES * 3u; // MAX_MESHLET_TRIANGLES * VERTS_PER_TRIANGLE(3)
    _drawIndirectResult.firstVertex = 0u;
    _drawIndirectResult.firstInstance = 0u;
  }

  let threshold = _uniforms.viewport.z;
  let screenHeight = _uniforms.viewport.y;
  let cotHalfFov = _uniforms.viewport.w;
  let mvpMatrix = _uniforms.vpMatrix;
  let meshlet = _meshlets[global_id.x];

  // TODO START: DEBUG HARDCODE
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
  // TODO END: DEBUG HARDCODE

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
  // var isVisible = parentError > threshold;

  if (isVisible){
    let instanceCountPtr = &_drawIndirectResult.instanceCount;
    let idx = atomicAdd(instanceCountPtr, 1u); // TODO Aggregate in groups of 8 and add 8 at a time. Would limit atomic 'stalls'.
    _drawnMeshletIdsResult[idx] = meshlet.id;
  }
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
