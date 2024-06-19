import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';
import { SHADER_SNIPPET_MESHLET_TREE_NODES } from '../../scene/naniteObject.ts';
import { CONFIG } from '../../constants.ts';

export const SHADER_SNIPPET_DRAWN_MESHLETS_LIST = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => `
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletIds: array<vec2<u32>>;
`;

export const SHADER_PARAMS = {
  workgroupSizeX: 32,
  maxWorkgroupsY: 1 << 15, // Spec says limit is 65535 (2^16 - 1), so we use 32768
  maxMeshletTriangles: `${CONFIG.nanite.preprocess.meshletMaxTriangles}u`,
  bindings: {
    renderUniforms: 0,
    meshlets: 1,
    drawnMeshletIds: 2,
    drawIndirectParams: 3,
    instancesTransforms: 4,
  },
};

///////////////////////////
/// SHADER CODE
/// We dispatch X=meshletCount, YZ=instance count
/// There is limit of 65535 and instance count can go over.
/// Either split instance ID between YZ (variant 1) and have tons of empty workgroups.
/// Or Z=1 and iterate in shader (variant 2).
///////////////////////////
const c = SHADER_PARAMS;
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${SHADER_SNIPPET_MESHLET_TREE_NODES(b.meshlets)}
${SHADER_SNIPPET_DRAWN_MESHLETS_LIST(b.drawnMeshletIds, 'read_write')}
${SHADER_SNIPPETS.GET_MVP_MAT}

/** arg for https://developer.mozilla.org/en-US/docs/Web/API/GPURenderPassEncoder/drawIndirect */
struct DrawIndirect{
  vertexCount: u32,
  instanceCount: atomic<u32>,
  firstVertex: u32,
  firstInstance : u32,
}
@group(0) @binding(${b.drawIndirectParams})
var<storage, read_write> _drawIndirectResult: DrawIndirect;

@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;


/** JS uses errorValue=Infnity when parent does not exist. I don't want to risk CPU->GPU transfer for inifinity, so I use ridiculous value */
const PARENT_ERROR_INFINITY: f32 = 99990.0f;



///////////////////////////
/// SHADER VARIANT 1: use (global_id.y, global_id.z) to get the instance id
///////////////////////////

@compute
@workgroup_size(${c.workgroupSizeX}, 1, 1)
fn main_SpreadYZ(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  // get meshlet
  let meshletIdx: u32 = global_id.x;
  if (meshletIdx >= arrayLength(&_meshlets)) {
    return;
  }
  let meshlet = _meshlets[meshletIdx];

  // reconstruct instanceId
  let tfxIdx: u32 = (global_id.z * ${c.maxWorkgroupsY}u) + global_id.y;
  if (tfxIdx >= arrayLength(&_instanceTransforms)) {
    return;
  }
  let modelMat = _instanceTransforms[tfxIdx];

  var isVisible = getVisibilityStatus(modelMat, meshlet);
  if (isVisible){
    registerDraw(tfxIdx, meshletIdx);
  }
}


///////////////////////////
/// SHADER VARIANT 2: iterate inside shader
///////////////////////////

@compute
@workgroup_size(${c.workgroupSizeX}, 1, 1)
fn main_Iter(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  // get meshlet
  let meshletIdx: u32 = global_id.x;
  if (meshletIdx >= arrayLength(&_meshlets)) {
    return;
  }
  let meshlet = _meshlets[meshletIdx];

  // prepare iters
  let instanceCount: u32 = arrayLength(&_instanceTransforms);
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    let modelMat = _instanceTransforms[tfxIdx];

    var isVisible = getVisibilityStatus(modelMat, meshlet);
    if (isVisible){
      registerDraw(tfxIdx, meshletIdx);
    }
  } 
}

///////////////////////////
/// UTILS
///////////////////////////

fn resetOtherDrawParams(global_id: vec3<u32>){
  if (global_id.x == 0u) {
    // We always draw 'MAX_MESHLET_TRIANGLES * VERTS_PER_TRIANGLE(3)' verts. Draw pass will discard if the meshlet has less.
    _drawIndirectResult.vertexCount = ${c.maxMeshletTriangles} * 3u;
    _drawIndirectResult.firstVertex = 0u;
    _drawIndirectResult.firstInstance = 0u;
  }
}

fn registerDraw(tfxIdx: u32, meshletIdx: u32){
   // TODO Aggregate atomic writes. Use ballot like [Wihlidal 2015]: Optimizing the Graphics Pipeline with Compute
   let idx = atomicAdd(&_drawIndirectResult.instanceCount, 1u);
   _drawnMeshletIds[idx] = vec2u(tfxIdx, meshletIdx);
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

fn getVisibilityStatus (
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  if (!isInsideCameraFrustum(modelMat, meshlet)) {
    return false;
  }

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
`;
