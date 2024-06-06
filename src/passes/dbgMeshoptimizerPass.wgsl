struct Uniforms {
    mvpMatrix: mat4x4<f32>,
    viewMatrix: mat4x4<f32>,
    viewport: vec4f,
};
@binding(0) @group(0)
var<uniform> _uniforms: Uniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) projPosition: vec4f,
  @location(1) wsPosition: vec4f,
  @location(2) @interpolate(flat) instanceIndex: u32,
};

fn checkIsCulled(projectedPosition: vec4f) -> bool {
  let x = projectedPosition.x;
  let y = projectedPosition.y;
  let z = projectedPosition.z;
  let clipZ = projectedPosition.w;
  let clip = 1.2 * projectedPosition.w;
  return z < -clipZ || z > clipZ ||
    x < -clip || x > clip ||
    y < -clip || y > clip;
}


@vertex
fn main_vs(
  @location(0) inWorldPos : vec3f,
  @builtin(vertex_index) inVertexIndex: u32,
  @builtin(instance_index) inInstanceIndex: u32,
) -> VertexOutput {
  var result: VertexOutput;

  var worldPos = vec4<f32>(inWorldPos.xyz, 1.0);
  var projectedPosition = _uniforms.mvpMatrix * worldPos;
  projectedPosition /= projectedPosition.w;
  result.position = vec4<f32>(projectedPosition.xyz, 1.0);
  result.projPosition = result.position;
  result.wsPosition = worldPos;
  result.instanceIndex = inInstanceIndex;

  return result;
}

const AMBIENT_LIGHT = 0.1;
const LIGHT_DIR = vec3(5., 5., 0.);

@fragment
fn main_fs(fragIn: VertexOutput) -> @location(0) vec4<f32> {
  let posWsDx = dpdxFine(fragIn.wsPosition);
  let posWsDy = dpdyFine(fragIn.wsPosition);

  if (checkIsCulled(fragIn.projPosition)) {
    discard;
  }
  
  let normal = normalize(cross(posWsDy.xyz, posWsDx.xyz));
  let lightDir = normalize(LIGHT_DIR);
  let NdotL = max(0.0, dot(normal.xyz, lightDir));

  let c = mix(AMBIENT_LIGHT, 1.0, NdotL);
  return vec4(c, c, c, 1.0);
}