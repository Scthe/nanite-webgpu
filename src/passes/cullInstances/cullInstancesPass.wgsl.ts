import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { CONFIG } from '../../constants.ts';
import { SNIPPET_OCCLUSION_CULLING } from '../_shaderSnippets/cullOcclusion.wgsl.ts';
import { SNIPPET_FRUSTUM_CULLING } from '../_shaderSnippets/cullFrustum.wgsl.ts';
import { SHADER_PARAMS as SHADER_PARAMS_CULL_MESHLETS } from '../cullMeshlets/cullMeshletsPass.wgsl.ts';
import {
  BUFFER_DRAWN_INSTANCES_LIST,
  BUFFER_DRAWN_INSTANCES_PARAMS,
} from '../../scene/naniteBuffers/drawnInstancesBuffer.ts';
import {
  BUFFER_DRAWN_IMPOSTORS_PARAMS,
  BUFFER_DRAWN_IMPOSTORS_LIST,
} from '../../scene/naniteBuffers/drawnImpostorsBuffer.ts';
import { BUFFER_INSTANCES } from '../../scene/naniteBuffers/instancesBuffer.ts';

export const SHADER_PARAMS = {
  workgroupSizeX: 32,
  maxWorkgroupsY: 1 << 15, // Spec says limit is 65535 (2^16 - 1), so we use 32768
  maxMeshletTriangles: `${CONFIG.nanite.preprocess.meshletMaxTriangles}u`,
  bindings: {
    renderUniforms: 0,
    instancesTransforms: 1,
    dispatchIndirectParams: 2,
    drawnInstanceIdsResult: 3,
    billboardsParams: 4,
    billboardsIdsResult: 5,
    depthPyramidTexture: 6,
    depthSampler: 7,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const c = SHADER_PARAMS;
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.UTILS}
${SNIPPET_FRUSTUM_CULLING}
${SNIPPET_OCCLUSION_CULLING}

// instance transforms
${BUFFER_INSTANCES(b.instancesTransforms)}

// cull params
${BUFFER_DRAWN_INSTANCES_PARAMS(b.dispatchIndirectParams, 'read_write')}
// cull: array with results
${BUFFER_DRAWN_INSTANCES_LIST(b.drawnInstanceIdsResult, 'read_write')}

// billboard params
${BUFFER_DRAWN_IMPOSTORS_PARAMS(b.billboardsParams, 'read_write')}
// billboard: array with results
${BUFFER_DRAWN_IMPOSTORS_LIST(b.billboardsIdsResult, 'read_write')}

// depth pyramid + sampler
@group(0) @binding(${b.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;
@group(0) @binding(${b.depthSampler})
var _depthSampler: sampler;



@compute
@workgroup_size(${c.workgroupSizeX}, 1, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  // set rest of the indirect draw params. Has to be first line in the shader in case we ooopsie and do early return by accident somewhere.
  resetOtherDrawParams(global_id);

  let settingsFlags = _uniforms.flags;
  let boundingSphere = _drawnInstancesParams.objectBoundingSphere;
  let MAX_WORKGROUPS_Y: u32 = ${SHADER_PARAMS_CULL_MESHLETS.maxWorkgroupsY}u;

  
  // prepare iters
  let instanceCount: u32 = _getInstanceCount();
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.x * iterCount;

  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    if (tfxIdx >= instanceCount) { continue; }
    let modelMat = _getInstanceTransform(tfxIdx);

    if (!isInstanceRendered(settingsFlags, modelMat, boundingSphere)){
      continue;
    }

    if (renderAsBillboard(settingsFlags, modelMat, boundingSphere)) {
      let idx = atomicAdd(&_drawnImpostorsParams.instanceCount, 1u);
      _drawnImpostorsList[idx] = tfxIdx;

    } else {
      // add 1, but no more than MAX_WORKGROUPS_Y.
      // meh impl, but..
      atomicAdd(&_drawnInstancesParams.workgroupsY, 1u);
      atomicMin(&_drawnInstancesParams.workgroupsY, MAX_WORKGROUPS_Y);
      
      // add to the ACTUALL total counter
      let idx = atomicAdd(&_drawnInstancesParams.actuallyDrawnInstances, 1u);
      _drawnInstancesList[idx] = tfxIdx;
    }
  } 
}

///////////////////////////
/// UTILS
///////////////////////////

fn isInstanceRendered(
  settingsFlags: u32,
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f
) -> bool {
  if (
    useInstancesFrustumCulling(settingsFlags) &&
    !isInsideCameraFrustum(modelMat, boundingSphere)
  ) {
    return false;
  }

  let overrideMipmap = getOverrideOcclusionCullMipmap(settingsFlags);
  if (
    useInstancesOcclusionCulling(settingsFlags) &&
    !isPassingOcclusionCulling(modelMat, boundingSphere, overrideMipmap)
  ) {
    return false;
  }

  return true;
}


fn renderAsBillboard(
  settingsFlags: u32,
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f
) -> bool {
  if (useForceBillboards(settingsFlags)) {
    return true;
  }

  var pixelSpan = vec2f();
  let projectionOK = projectSphereToScreen(modelMat, boundingSphere, &pixelSpan);
  return (
    projectionOK &&
    pixelSpan.x * pixelSpan.y < _uniforms.billboardThreshold
  );
}

fn resetOtherDrawParams(global_id: vec3<u32>){
  if (global_id.x == 0u) {
    _drawnInstancesParams.workgroupsX = ceilDivideU32(
      _drawnInstancesParams.allMeshletsCount,
      ${SHADER_PARAMS_CULL_MESHLETS.workgroupSizeX}u
    );
    _drawnInstancesParams.workgroupsZ = 1u;

    _drawnImpostorsParams.vertexCount = 6u; // billboard
    _drawnImpostorsParams.firstVertex = 0u;
    _drawnImpostorsParams.firstInstance = 0u;
  }
}

`;
