/** Fragment shader snippet for discard. Mostly for Z-axis. */
export const FS_CHECK_IS_CULLED = `
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
`;

/** Fragment shader snippet for discard. Mostly for Z-axis. */
export const FS_FAKE_LIGHTING = `
fn fakeLighting(wsPosition: vec4f) -> f32{
  let AMBIENT_LIGHT = 0.1;
  let LIGHT_DIR = vec3(5., 5., 0.);

  let posWsDx = dpdxFine(wsPosition);
  let posWsDy = dpdyFine(wsPosition);
  let normal = normalize(cross(posWsDy.xyz, posWsDx.xyz));
  let lightDir = normalize(LIGHT_DIR);
  let NdotL = max(0.0, dot(normal.xyz, lightDir));
  return mix(AMBIENT_LIGHT, 1.0, NdotL);
}
`;

/** Get random color based on index. Same index == same color every frame. */
export const GET_RANDOM_COLOR = `
const COLOR_COUNT = 7u;
const COLORS = array<vec3f, COLOR_COUNT>(
    vec3f(1., 1., 1.),
    vec3f(1., 0., 0.),
    vec3f(0., 1., 0.),
    vec3f(0., 0., 1.),
    vec3f(1., 1., 0.),
    vec3f(0., 1., 1.),
    vec3f(1., 0., 1.),
);
fn getRandomColor(idx: u32) -> vec3f {
  return COLORS[idx % COLOR_COUNT];
}
`;
