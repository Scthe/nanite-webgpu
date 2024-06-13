@group(0) @binding(1)
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) projPosition: vec4f,
  @location(1) wsPosition: vec4f,
  @location(2) @interpolate(flat) instanceIndex: u32,
};


@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  let modelMat = _instanceTransforms[inInstanceIndex];
  let mvpMatrix = getMVP_Mat(modelMat, _uniforms.viewMatrix, _uniforms.projMatrix); // either here or upload from CPU
  let worldPos = vec4<f32>(inWorldPos.xyz, 1.0);
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

  if (checkIsCulled(fragIn.projPosition)) {
    discard;
  }
  
  var color = getRandomColor(fragIn.instanceIndex);
  color = color * c;
  return vec4(color.xyz, 1.0);
}