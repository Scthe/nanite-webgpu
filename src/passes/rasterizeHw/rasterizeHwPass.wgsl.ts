import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { BUFFER_MESHLET_DATA } from '../../scene/naniteBuffers/meshletsDataBuffer.ts';
import { SNIPPET_SHADING_PBR } from '../_shaderSnippets/pbr.wgsl.ts';
import { SNIPPET_SHADING } from '../_shaderSnippets/shading.wgsl.ts';
import {
  SHADING_MODE_TRIANGLE,
  SHADING_MODE_MESHLET,
  SHADING_MODE_LOD_LEVEL,
  SHADING_MODE_NORMALS,
  SHADING_MODE_HW_SW_IMPOSTOR,
} from '../../constants.ts';
import { BUFFER_DRAWN_MESHLETS_LIST } from '../../scene/naniteBuffers/drawnMeshletsBuffer.ts';
import { BUFFER_VERTEX_POSITIONS } from '../../scene/naniteBuffers/vertexPositionsBuffer.ts';
import { BUFFER_VERTEX_NORMALS } from '../../scene/naniteBuffers/vertexNormalsBuffer.ts';
import { BUFFER_VERTEX_UVS } from '../../scene/naniteBuffers/vertexUVsBuffer.ts';
import { BUFFER_INSTANCES } from '../../scene/naniteBuffers/instancesBuffer.ts';
import { BUFFER_INDEX_BUFFER } from '../../scene/naniteBuffers/index.ts';

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

${SHADER_SNIPPETS.GET_MVP_MAT}
${SHADER_SNIPPETS.FS_FAKE_LIGHTING}
${SHADER_SNIPPETS.GET_RANDOM_COLOR}
${SHADER_SNIPPETS.FS_NORMAL_FROM_DERIVATIVES}
${SHADER_SNIPPETS.NORMALS_UTILS}
${SNIPPET_SHADING_PBR}
${SNIPPET_SHADING}

${RenderUniformsBuffer.SHADER_SNIPPET(b.renderUniforms)}
${BUFFER_MESHLET_DATA(b.meshlets)}
${BUFFER_DRAWN_MESHLETS_LIST(b.drawnMeshletIds, 'read')}
${BUFFER_VERTEX_POSITIONS(b.vertexPositions)}
${BUFFER_VERTEX_NORMALS(b.vertexNormals)}
${BUFFER_VERTEX_UVS(b.vertexUV)}
${BUFFER_INSTANCES(b.instancesTransforms)}
${BUFFER_INDEX_BUFFER(b.indexBuffer)}

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
  let drawData: vec2u = _getMeshletHardwareDraw(inInstanceIndex); // .x - transformIdx, .y - meshletIdx
  let meshlet = _meshlets[drawData.y];
  result.meshletId = drawData.y;
  let modelMat = _getInstanceTransform(drawData.x);

  // We always draw MAX_MESHLET_TRIANGLES * 3u, but meshlet might have less: discard.
  // While this is not the most performant approach, it has tiny memory footprint
  // (uvec2 * instances count * meshlets count).
  // We just say: draw X instances, each is (MAX_MESHLET_TRIANGLES * 3u) verts.
  if (inVertexIndex >= meshlet.triangleCount * 3) {
    result.position.x = OUT_OF_SIGHT; // NOTE: the spec does not say NaN would discard.
    result.position.y = OUT_OF_SIGHT; //       Suprised? Let's just say, I do not have 'mixed'
    result.position.z = OUT_OF_SIGHT; //       feelings about WGSL.
    result.position.w = 1.0;
    return result;
  }

  let vertexIdx = _indexBuffer[meshlet.firstIndexOffset + inVertexIndex];
  let vertexPos = _getVertexPosition(vertexIdx); // assumes .w=1
  let vertexN = _getVertexNormal(vertexIdx);
  let vertexUV = _getVertexUV(vertexIdx);

  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);
  let projectedPosition = mvpMatrix * vertexPos;
  let positionWS = modelMat * vertexPos;
  result.position = projectedPosition;
  result.positionWS = positionWS;
  result.normalWS = transformNormalToWorldSpace(modelMat, vertexN);
  result.uv = vertexUV;
  result.instanceIdx = drawData.x;
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
    
  } else if (shadingMode == ${SHADING_MODE_HW_SW_IMPOSTOR}u) {
    color = vec3f(1., 0., 0.);
    
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
