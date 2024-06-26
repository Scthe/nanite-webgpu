import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SHADER_SNIPPET_DRAWN_MESHLETS_LIST } from './naniteVisibilityPass.wgsl.ts';
import { SHADER_SNIPPET_MESHLET_TREE_NODES } from '../../scene/naniteObject.ts';
import { SNIPPET_SHADING_PBR } from '../_shaderSnippets/pbr.wgsl.ts';
import { SNIPPET_SHADING } from '../_shaderSnippets/shading.wgsl.ts';
import {
  SHADING_MODE_TRIANGLE,
  SHADING_MODE_MESHLET,
  SHADING_MODE_LOD_LEVEL,
  SHADING_MODE_NORMALS,
} from '../../constants.ts';

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    meshlets: 1,
    drawnMeshletIds: 2,
    instancesTransforms: 3,
    vertexPositions: 4,
    vertexNormals: 5,
    vertexUV: 6,
    indexBuffer: 7,
    diffuseTexture: 8,
    sampler: 9,
  },
};

///////////////////////////
/// SHADER CODE
///////////////////////////
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${SHADER_SNIPPET_MESHLET_TREE_NODES(b.meshlets)}
${SHADER_SNIPPET_DRAWN_MESHLETS_LIST(b.drawnMeshletIds, 'read')}
${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${SHADER_SNIPPETS.FS_NORMAL_FROM_DERIVATIVES}
${SHADER_SNIPPETS.NORMALS_UTILS}
${SNIPPET_SHADING_PBR}
${SNIPPET_SHADING}

@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

// WARNING: SSBO with 'array<vec3f>' does not work. Forces 'array<vec4f>'.
// DO NOT ASK HOW I HAVE DEBUGGED THIS.
@group(0) @binding(${b.vertexPositions})
var<storage, read> _vertexPositions: array<vec4f>;

@group(0) @binding(${b.vertexNormals})
var<storage, read> _vertexNormals: array<vec2f>;

@group(0) @binding(${b.vertexUV})
var<storage, read> _vertexUV: array<vec2f>;

@group(0) @binding(${b.indexBuffer})
var<storage, read> _indexBuffer: array<u32>;

@group(0) @binding(${b.diffuseTexture})
var _diffuseTexture: texture_2d<f32>;

@group(0) @binding(${b.sampler})
var _sampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) positionWS: vec4f,
  @location(1) normalWS: vec3f,
  @location(2) uv: vec2f,
  @location(3) @interpolate(flat) instanceIdx: u32,
  @location(4) @interpolate(flat) meshletId: u32,
  @location(5) @interpolate(flat) triangleIdx: u32,
};

const OUT_OF_SIGHT = 9999999.0;

@vertex
fn main_vs(
  @builtin(vertex_index) inVertexIndex: u32, // [0, triangleCount * VERTS_IN_TRIANGLE]
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;
  let meshletId: vec2u = _drawnMeshletIds[inInstanceIndex]; // .x - transfromIdx, .y - meshletIdx
  let meshlet = _meshlets[meshletId.y];
  result.meshletId = meshletId.y;
  let modelMat = _instanceTransforms[meshletId.x];

  // we always draw MAX_MESHLET_TRIANGLES * 3u, but meshlet might have less. Discard
  if (inVertexIndex >= meshlet.triangleCount * 3) {
    result.position.x = OUT_OF_SIGHT;
    result.position.y = OUT_OF_SIGHT;
    result.position.z = OUT_OF_SIGHT;
    result.position.w = 1.0;
    return result;
  }

  let vertexIdx = _indexBuffer[meshlet.firstIndexOffset + inVertexIndex];
  let vertexPos = _vertexPositions[vertexIdx]; // assumes .w=1
  let vertexN = decodeOctahedronNormal(_vertexNormals[vertexIdx]);
  let vertexUV = _vertexUV[vertexIdx];

  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);
  let projectedPosition = mvpMatrix * vertexPos;
  let positionWS = modelMat * vertexPos;
  result.position = projectedPosition;
  result.positionWS = positionWS;
  result.normalWS = transformNormalToWorldSpace(modelMat, vertexN);
  result.uv = vertexUV;
  result.instanceIdx = meshletId.x;
  result.triangleIdx = inVertexIndex;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let shadingMode = getShadingMode(_uniforms.flags);
  var color: vec3f;
  
  if (shadingMode == ${SHADING_MODE_TRIANGLE}u) {
    color = getRandomColor(fragIn.triangleIdx);
  
  } else if (shadingMode == ${SHADING_MODE_MESHLET}u) {
    color = getRandomColor(fragIn.meshletId);

  } else if (shadingMode == ${SHADING_MODE_LOD_LEVEL}u) {
    let meshlet = _meshlets[fragIn.meshletId];
    let lodLevel = meshlet.lodLevel;
    color = getRandomColor(lodLevel);
  
  } else if (shadingMode == ${SHADING_MODE_NORMALS}u) {
    color = abs(normalize(fragIn.normalWS));
    
  } else {
    var material: Material;
    createDefaultMaterial(&material, fragIn.positionWS);
    material.normal = normalize(fragIn.normalWS);
    material.albedo = textureSample(_diffuseTexture, _sampler, fragIn.uv).rgb;

    // shading
    var lights = array<Light, LIGHT_COUNT>();
    fillLightsData(&lights);
    color = doShading(material, AMBIENT_LIGHT, lights);
  }

  return vec4(color.xyz, 1.0);
}
`;
