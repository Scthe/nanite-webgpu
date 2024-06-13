// TODO duplicated code from normal DrawNanitePass

@group(0) @binding(2)
var<storage, read> _drawnMeshletIdsResult: array<u32>;

@group(0) @binding(3)
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

// WARNING: SSBO with `array<vec3f>` does not work. Forces `array<vec4f>`.
// DO NOT ASK HOW I HAVE DEBUGGED THIS.
@group(0) @binding(4)
var<storage, read> _vertexPositions: array<vec4f>;

@group(0) @binding(5)
var<storage, read> _indexBuffer: array<u32>;


struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) projPosition: vec4f,
  @location(1) wsPosition: vec4f,
  @location(2) @interpolate(flat) instanceIndex: u32,
  @location(3) @interpolate(flat) meshletId: u32,
};

const INVALID_MESHLET: u32 = 1 << 30;


@vertex
fn main_vs(
  @builtin(vertex_index) inVertexIndex: u32, // [0, triangleCount * VERTS_IN_TRIANGLE]
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;
  let meshletId = _drawnMeshletIdsResult[inInstanceIndex]; // inInstanceIndex; // TODO get from _drawnMeshletIdsResult
  let meshlet = _meshlets[meshletId];
  result.meshletId = meshletId;
  let tfxId = 0; // TODO get from _drawnMeshletIdsResult
  let modelMat = _instanceTransforms[tfxId]; // unused anyway

  // we always draw __MAX_MESHLET_TRIANGLES * 3u, but meshlet might have less. Discard
  if (inVertexIndex >= meshlet.triangleCount * 3) {
    result.meshletId = INVALID_MESHLET;
    return result;
  }

  let vertexIdx = _indexBuffer[meshlet.firstIndexOffset + inVertexIndex];
  let worldPos = _vertexPositions[vertexIdx]; // assumes .w=1


  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix);
  var projectedPosition = mvpMatrix * worldPos;
  // projectedPosition /= projectedPosition.w; // ?! Am I just getting old?
  result.position = projectedPosition;
  result.projPosition = projectedPosition;
  result.wsPosition = worldPos; // skips multiply with model matrix for non-world-space ligthing
  result.instanceIndex = inInstanceIndex;

  return result;
}


@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let c = fakeLighting(fragIn.wsPosition);

  if (fragIn.meshletId == INVALID_MESHLET || checkIsCulled(fragIn.projPosition)) {
    discard;
  }
  
  var color = getRandomColor(fragIn.meshletId);
  color = color * c;
  return vec4(color.xyz, 1.0);
}