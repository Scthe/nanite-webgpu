import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { SHADER_SNIPPET_MESHLET_TREE_NODES } from '../../scene/naniteObject.ts';
import { CONFIG } from '../../constants.ts';
import { SNIPPET_OCCLUSION_CULLING } from '../_shaderSnippets/cullOcclusion.wgsl.ts';
import { SNIPPET_FRUSTUM_CULLING } from '../_shaderSnippets/cullFrustum.wgsl.ts';
import { SNIPPET_NANITE_LOD_CULLING } from '../_shaderSnippets/nanite.wgsl.ts';
import {
  SHADER_SNIPPET_INSTANCES_CULL_PARAMS,
  SHADER_SNIPPET_INSTANCES_CULL_ARRAY,
} from '../cullInstances/cullInstancesBuffer.ts';

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
    depthPyramidTexture: 5,
    depthSampler: 6,
    indirectDispatchIndirectParams: 7,
    indirectDrawnInstanceIdsResult: 8,
  },
};

///////////////////////////
/// SHADER CODE
/// We dispatch X=meshletCount, YZ=instance count
/// There is limit of 65535 and instance count can go over.
/// Variant 1: Split instance ID between YZ and have tons of empty workgroups.
/// Variant 2: Z=1 and iterate in shader.
/// Variant 3: Same as variant 2, but dispatch indirect based on cullInstancesPass.
///////////////////////////
const c = SHADER_PARAMS;
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${SHADER_SNIPPET_MESHLET_TREE_NODES(b.meshlets)}
${SHADER_SNIPPET_DRAWN_MESHLETS_LIST(b.drawnMeshletIds, 'read_write')}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.UTILS}
${SNIPPET_OCCLUSION_CULLING}
${SNIPPET_FRUSTUM_CULLING}
${SNIPPET_NANITE_LOD_CULLING}

@group(0) @binding(${b.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;

@group(0) @binding(${b.depthSampler})
var _depthSampler: sampler;


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

  let settingsFlags = _uniforms.flags;
  if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
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
  let settingsFlags = _uniforms.flags;

  // prepare iters
  let instanceCount: u32 = arrayLength(&_instanceTransforms);
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    let modelMat = _instanceTransforms[tfxIdx];

    if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
      registerDraw(tfxIdx, meshletIdx);
    }
  } 
}

///////////////////////////
/// SHADER VARIANT 2: iterate inside shader INDIRECT DISPATCH
///////////////////////////



// cull params
${SHADER_SNIPPET_INSTANCES_CULL_PARAMS(
  b.indirectDispatchIndirectParams,
  'read'
)}
// array with results
${SHADER_SNIPPET_INSTANCES_CULL_ARRAY(b.indirectDrawnInstanceIdsResult, 'read')}

@compute
@workgroup_size(${c.workgroupSizeX}, 1, 1)
fn main_Indirect(
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
  let settingsFlags = _uniforms.flags;

  // prepare iters
  let instanceCount: u32 = _cullParams.actuallyDrawnInstances; //arrayLength(&_instanceTransforms);
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let iterOffset: u32 = tfxOffset + i;
    let tfxIdx: u32 = _drawnInstanceIdsResult[iterOffset];
    let modelMat = _instanceTransforms[tfxIdx];

    if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
      registerDraw(tfxIdx, meshletIdx);
    }
  } 
}

///////////////////////////
/// UTILS
///////////////////////////

fn isMeshletRendered(
  settingsFlags: u32,
  modelMat: mat4x4<f32>,
  meshlet: NaniteMeshletTreeNode
) -> bool {
  if (
    useFrustumCulling(settingsFlags) &&
    !isInsideCameraFrustum(modelMat, meshlet.ownBoundingSphere)
  ) {
    return false;
  }

  let overrideMipmap = getOverrideOcclusionCullMipmap(settingsFlags);
  if (
    useOcclusionCulling(settingsFlags) &&
    !isPassingOcclusionCulling(modelMat, meshlet.ownBoundingSphere, overrideMipmap)
  ) {
    return false;
  }

  return isCorrectNaniteLOD(modelMat, meshlet);
}

fn resetOtherDrawParams(global_id: vec3<u32>){
  if (global_id.x == 0u) {
    // We always draw 'MAX_MESHLET_TRIANGLES * VERTS_PER_TRIANGLE(3)' verts. Draw pass will discard if the meshlet has less.
    _drawIndirectResult.vertexCount = ${c.maxMeshletTriangles} * 3u;
    _drawIndirectResult.firstVertex = 0u;
    _drawIndirectResult.firstInstance = 0u;
  }
}

fn registerDraw(tfxIdx: u32, meshletIdx: u32){
   // TODO [LOW] Aggregate atomic writes. Use ballot like [Wihlidal 2015]:
   // "Optimizing the Graphics Pipeline with Compute"
   // 
   // TBH this *could* be optimized by the shader compiler. It can assume that
   // some threads in warp add 1 to the atomic. It *COULD* then add
   // to the global atomic the sum ONCE and re-distribute result among the threads.
   // See NV_shader_thread_group, functionality 4.
   let idx = atomicAdd(&_drawIndirectResult.instanceCount, 1u);
   _drawnMeshletIds[idx] = vec2u(tfxIdx, meshletIdx);
}
`;
