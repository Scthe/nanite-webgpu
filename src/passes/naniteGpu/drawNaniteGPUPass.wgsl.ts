import * as SHADER_SNIPPETS from '../_shaderSnippets/shaderSnippets.wgls.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { SHADER_SNIPPET_DRAWN_MESHLETS_LIST } from './naniteVisibilityPass.wgsl.ts';
import { SHADER_SNIPPET_MESHLET_TREE_NODES } from '../../scene/naniteObject.ts';

// TODO duplicated code from normal DrawNanitePass

export const SHADER_PARAMS = {
  bindings: {
    renderUniforms: 0,
    meshlets: 1,
    drawnMeshletIds: 2,
    instancesTransforms: 3,
    vertexPositions: 4,
    indexBuffer: 5,
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

@group(0) @binding(${b.instancesTransforms})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

// WARNING: SSBO with 'array<vec3f>' does not work. Forces 'array<vec4f>'.
// DO NOT ASK HOW I HAVE DEBUGGED THIS.
@group(0) @binding(${b.vertexPositions})
var<storage, read> _vertexPositions: array<vec4f>;

@group(0) @binding(${b.indexBuffer})
var<storage, read> _indexBuffer: array<u32>;


struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) wsPosition: vec4f,
  @location(1) @interpolate(flat) instanceIndex: u32,
  @location(2) @interpolate(flat) meshletId: u32,
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
  let worldPos = _vertexPositions[vertexIdx]; // assumes .w=1


  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);
  var projectedPosition = mvpMatrix * worldPos;
  // projectedPosition /= projectedPosition.w; // ?! Am I just getting old?
  result.position = projectedPosition;
  result.wsPosition = worldPos; // skips multiply with model matrix for non-world-space ligthing
  result.instanceIndex = inInstanceIndex;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let c = fakeLighting(fragIn.wsPosition);
  var color = getRandomColor(fragIn.meshletId);
  color = color * c;
  return vec4(color.xyz, 1.0);
}
`;
