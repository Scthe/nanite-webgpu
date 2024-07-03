import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { CONFIG } from '../../constants.ts';
import { SNIPPET_OCCLUSION_CULLING } from '../_shaderSnippets/cullOcclusion.wgsl.ts';
import { SNIPPET_FRUSTUM_CULLING } from '../_shaderSnippets/cullFrustum.wgsl.ts';
import { SHADER_PARAMS as SHADER_PARAMS_VISIBILITY } from '../naniteGpu/naniteVisibilityPass.wgsl.ts';
import {
  SHADER_SNIPPET_INSTANCES_CULL_ARRAY,
  SHADER_SNIPPET_INSTANCES_CULL_PARAMS,
} from './cullInstancesBuffer.ts';
import {
  SHADER_SNIPPET_BILLBOARD_DRAW_PARAMS,
  SHADER_SNIPPET_BILLBOARD_ARRAY,
} from '../naniteBillboard/naniteBillboardsBuffer.ts';

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
@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

// cull params
${SHADER_SNIPPET_INSTANCES_CULL_PARAMS(b.dispatchIndirectParams, 'read_write')}
// cull: array with results
${SHADER_SNIPPET_INSTANCES_CULL_ARRAY(b.drawnInstanceIdsResult, 'read_write')}

// billboard params
${SHADER_SNIPPET_BILLBOARD_DRAW_PARAMS(b.billboardsParams, 'read_write')}
// billboard: array with results
${SHADER_SNIPPET_BILLBOARD_ARRAY(b.billboardsIdsResult, 'read_write')}

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
  let boundingSphere = _cullParams.objectBoundingSphere;
  let MAX_WORKGROUPS_Y: u32 = ${SHADER_PARAMS_VISIBILITY.maxWorkgroupsY}u;

  
  // prepare iters
  let instanceCount: u32 = arrayLength(&_instanceTransforms);
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.x * iterCount;

  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    if (tfxIdx >= instanceCount) { continue; }
    let modelMat = _instanceTransforms[tfxIdx];

    if (!isInstanceRendered(settingsFlags, modelMat, boundingSphere)){
      continue;
    }

    //  TODO [NOW] add flag to render all as billboard
    if (renderAsBillboard(modelMat, boundingSphere)) {
      let idx = atomicAdd(&_billboardDrawParams.instanceCount, 1u);
      _billboardIdsArray[idx] = tfxIdx;

    } else {
      // add 1, but no more than MAX_WORKGROUPS_Y.
      // meh impl, but..
      atomicAdd(&_cullParams.workgroupsY, 1u);
      atomicMin(&_cullParams.workgroupsY, MAX_WORKGROUPS_Y);
      
      // add to the ACTUALL total counter
      let idx = atomicAdd(&_cullParams.actuallyDrawnInstances, 1u);
      _drawnInstanceIdsResult[idx] = tfxIdx;
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
  modelMat: mat4x4<f32>,
  boundingSphere: vec4f
) -> bool {
  // get AABB in projection space
  // TODO [LOW] duplicate from occlusion culling
  let viewportSize = _uniforms.viewport.xy;
  let viewMat = _uniforms.viewMatrix;
  let projMat = _uniforms.projMatrix;
  var aabb = vec4f();
  let center = viewMat * modelMat * vec4f(boundingSphere.xyz, 1.);
  let r = boundingSphere.w;
  let projectionOK = projectSphereView(projMat, center.xyz, r, &aabb);
  let pixelSpanW = abs(aabb.z - aabb.x) * viewportSize.x;
  let pixelSpanH = abs(aabb.w - aabb.y) * viewportSize.y;
  let pixelSpan = pixelSpanW * pixelSpanH;
  return (
    projectionOK &&
    pixelSpan < _uniforms.billboardThreshold
  );
}

fn resetOtherDrawParams(global_id: vec3<u32>){
  if (global_id.x == 0u) {
    _cullParams.workgroupsX = ceilDivideU32(
      _cullParams.allMeshletsCount,
      ${SHADER_PARAMS_VISIBILITY.workgroupSizeX}u
    );
    _cullParams.workgroupsZ = 1u;

    _billboardDrawParams.vertexCount = 6u; // billboard
    _billboardDrawParams.firstVertex = 0u;
    _billboardDrawParams.firstInstance = 0u;
  }
}

`;
