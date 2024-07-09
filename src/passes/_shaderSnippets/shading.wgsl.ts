import { CONFIG } from '../../constants.ts';

const LIGHT_COUNT = CONFIG.lightsCount;

export const DEFAULT_COLOR: [number, number, number] = [0.9, 0.9, 0.9];

/** https://github.com/Scthe/WebFX/blob/master/src/shaders/sintel.frag.glsl#L135 */
export const SNIPPET_SHADING = /* wgsl */ `

const LIGHT_COUNT = ${LIGHT_COUNT}u;
const PI: f32 = ${Math.PI};


struct Material {
  positionWS: vec3f,
  normal: vec3f,
  toEye: vec3f,
  // disney pbr:
  albedo: vec3f,
  roughness: f32,
  isMetallic: f32,
  // ao: f32
};

struct Light {
  position: vec3f,
  color: vec3f,
  intensity: f32
};

fn unpackLight(pos: vec3f, color: vec4f, light: ptr<function, Light>) {
  (*light).position = pos;
  (*light).color = color.rgb;
  (*light).intensity = color.a;
}


fn dotMax0 (n: vec3f, toEye: vec3f) -> f32 {
  return max(0.0, dot(n, toEye));
}

fn doShading(
  material: Material,
  ambientLight: vec4f,
  lights: array<Light, ${LIGHT_COUNT}>
) -> vec3f {
  let ambient = ambientLight.rgb * ambientLight.a; // * material.ao;
  var radianceSum = vec3(0.0);

  // this used to be a for-loop, but wgpu's Naga complains:
  // let light = lights[i];
  //                    ^ The expression may only be indexed by a constant
  radianceSum += disneyPBR(material, lights[0]);
  radianceSum += disneyPBR(material, lights[1]);

  return ambient + radianceSum;
}

/////////////////////////////
/////////////////////////////
/// Config

const AMBIENT_LIGHT = vec4f(1., 1., 1., 0.05);
const LIGHT_FAR = 99999.0;

fn fillLightsData(
  lights: ptr<function, array<Light, LIGHT_COUNT>>
){
  (*lights)[0].position = vec3f(LIGHT_FAR, LIGHT_FAR, 0); // world space
  (*lights)[0].color = vec3f(1., 0.95, 0.8);
  (*lights)[0].intensity = 1.5;

  (*lights)[1].position = vec3f(-LIGHT_FAR, -LIGHT_FAR / 3.0, LIGHT_FAR / 3.0); // world space
  (*lights)[1].color = vec3f(0.8, 0.8, 1.);
  (*lights)[1].intensity = 0.7;
}

fn createDefaultMaterial(
  material: ptr<function, Material>,
  positionWS: vec4f
){
  let cameraPos = _uniforms.cameraPosition.xyz;
  
  (*material).positionWS = positionWS.xyz;
  (*material).normal = normalFromDerivatives(positionWS);
  (*material).toEye = normalize(cameraPos - positionWS.xyz);
  // brdf params:
  (*material).albedo = vec3f(${DEFAULT_COLOR[0]}, ${DEFAULT_COLOR[1]}, ${DEFAULT_COLOR[2]});
  (*material).roughness = 0.8;
  (*material).isMetallic = 0.0; // oops!
  // material.ao = 1.0;
}

`;
