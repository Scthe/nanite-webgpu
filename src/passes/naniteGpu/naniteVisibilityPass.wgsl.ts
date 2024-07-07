import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { BUFFER_MESHLET_DATA } from '../../scene/naniteBuffers/meshletsDataBuffer.ts';
import { CONFIG } from '../../constants.ts';
import { SNIPPET_OCCLUSION_CULLING } from '../_shaderSnippets/cullOcclusion.wgsl.ts';
import { SNIPPET_FRUSTUM_CULLING } from '../_shaderSnippets/cullFrustum.wgsl.ts';
import { SNIPPET_NANITE_LOD_CULLING } from '../_shaderSnippets/nanite.wgsl.ts';
import {
  BUFFER_DRAWN_INSTANCES_PARAMS,
  BUFFER_DRAWN_INSTANCES_LIST,
} from '../../scene/naniteBuffers/drawnInstancesBuffer.ts';
import {
  BUFFER_DRAWN_MESHLETS_LIST,
  BUFFER_DRAWN_MESHLETS_PARAMS,
} from '../../scene/naniteBuffers/drawnMeshletsBuffer.ts';
import { BUFFER_INSTANCES } from '../../scene/naniteBuffers/instancesBuffer.ts';
import { SHADER_PARAMS as SHADER_PARAMS_RASTERIZE_SW } from '../rasterizeSw/rasterizeSwPass.wgsl.ts';
import {
  BUFFER_DRAWN_MESHLETS_SW_PARAMS,
  BUFFER_DRAWN_MESHLETS_SW_LIST,
} from '../../scene/naniteBuffers/drawnMeshletsSwBuffer.ts';

export const SHADER_PARAMS = {
  workgroupSizeX: 32,
  maxWorkgroupsY: 1 << 15, // Spec says limit is 65535 (2^16 - 1), so we use 32768
  maxMeshletTriangles: `${CONFIG.nanite.preprocess.meshletMaxTriangles}u`,
  bindings: {
    renderUniforms: 0,
    meshletsData: 1,
    instancesTransforms: 2,
    drawnMeshletsParams: 3,
    drawnMeshletsList: 4,
    drawnMeshletsSwParams: 5,
    drawnMeshletsSwList: 6,
    depthPyramidTexture: 7,
    depthSampler: 8,
    drawnInstancesParams: 9,
    drawnInstancesList: 10,
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

${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.UTILS}
${SNIPPET_OCCLUSION_CULLING}
${SNIPPET_FRUSTUM_CULLING}
${SNIPPET_NANITE_LOD_CULLING}

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${BUFFER_MESHLET_DATA(b.meshletsData)}
${BUFFER_DRAWN_MESHLETS_PARAMS(b.drawnMeshletsParams, 'read_write')}
${BUFFER_DRAWN_MESHLETS_LIST(b.drawnMeshletsList, 'read_write')}
${BUFFER_DRAWN_MESHLETS_SW_PARAMS(b.drawnMeshletsSwParams, 'read_write')}
${BUFFER_DRAWN_MESHLETS_SW_LIST(b.drawnMeshletsSwList, 'read_write')}
${BUFFER_INSTANCES(b.instancesTransforms)}

@group(0) @binding(${b.depthPyramidTexture})
var _depthPyramidTexture: texture_2d<f32>;

@group(0) @binding(${b.depthSampler})
var _depthSampler: sampler;


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
  if (tfxIdx >= _getInstanceCount()) {
    return;
  }
  let modelMat = _getInstanceTransform(tfxIdx);

  let settingsFlags = _uniforms.flags;
  if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
    registerDraw(modelMat, meshlet.ownBoundingSphere, tfxIdx, meshletIdx);
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
  let instanceCount: u32 = _getInstanceCount();
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let tfxIdx: u32 = tfxOffset + i;
    let modelMat = _getInstanceTransform(tfxIdx);

    if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
      registerDraw(modelMat, meshlet.ownBoundingSphere, tfxIdx, meshletIdx);
    }
  } 
}

///////////////////////////
/// SHADER VARIANT 2: iterate inside shader INDIRECT DISPATCH
///////////////////////////



// cull params
${BUFFER_DRAWN_INSTANCES_PARAMS(b.drawnInstancesParams, 'read')}
// array with results
${BUFFER_DRAWN_INSTANCES_LIST(b.drawnInstancesList, 'read')}

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
  let instanceCount: u32 = _drawnInstancesParams.actuallyDrawnInstances;
  let iterCount: u32 = ceilDivideU32(instanceCount, ${c.maxWorkgroupsY}u);
  let tfxOffset: u32 = global_id.y * iterCount;
  for(var i: u32 = 0u; i < iterCount; i++){
    let iterOffset: u32 = tfxOffset + i;
    let tfxIdx: u32 = _drawnInstancesList[iterOffset];
    let modelMat = _getInstanceTransform(tfxIdx);

    if (isMeshletRendered(settingsFlags, modelMat, meshlet)){
      registerDraw(modelMat, meshlet.ownBoundingSphere, tfxIdx, meshletIdx);
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
    _drawnMeshletsParams.vertexCount = ${c.maxMeshletTriangles} * 3u;
    _drawnMeshletsParams.firstVertex = 0u;
    _drawnMeshletsParams.firstInstance = 0u;

    _drawnMeshletsSwParams.workgroupsX = ceilDivideU32(
      ${CONFIG.nanite.preprocess.meshletMaxTriangles}u,
      ${SHADER_PARAMS_RASTERIZE_SW.workgroupSizeX}u
    );
    _drawnMeshletsSwParams.workgroupsZ = 1u;
  }
}

fn registerDraw(
  modelMat: mat4x4f,
  boundingSphere: vec4f,
  tfxIdx: u32,
  meshletIdx: u32
){
  // TODO [LOW] Aggregate atomic writes. Use ballot like [Wihlidal 2015]:
  // "Optimizing the Graphics Pipeline with Compute"
  // 
  // TBH this *could* be optimized by the shader compiler. It can assume that
  // some threads in warp add 1 to the atomic. It *COULD* then add
  // to the global atomic the sum ONCE and re-distribute result among the threads.
  // See NV_shader_thread_group, functionality 4.

  
  var pixelSpan = vec2f();
  let projectionOK = projectSphereToScreen(modelMat, boundingSphere, &pixelSpan);
  let useSoftwareRasterizer = projectionOK &&
    pixelSpan.x * pixelSpan.y < _uniforms.softwareRasterizerThreshold; 

  if (useSoftwareRasterizer) {
    // (software rasterizer)
    // add 1, but no more than MAX_WORKGROUPS_Y.
    // meh impl, but..
    let MAX_WORKGROUPS_Y: u32 = ${SHADER_PARAMS_RASTERIZE_SW.maxWorkgroupsY}u;
    atomicAdd(&_drawnMeshletsSwParams.workgroupsY, 1u);
    atomicMin(&_drawnMeshletsSwParams.workgroupsY, MAX_WORKGROUPS_Y);
      
    // add to the ACTUALL total counter
    let idx = atomicAdd(&_drawnMeshletsSwParams.actuallyDrawnMeshlets, 1u);
    _drawnMeshletsSwList[idx] = vec2u(tfxIdx, meshletIdx);

  } else {
     // (hardware rasterizer)
    let idx = atomicAdd(&_drawnMeshletsParams.instanceCount, 1u);
    _drawnMeshletsList[idx] = vec2u(tfxIdx, meshletIdx);
  }
}
`;
