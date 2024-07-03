export const SNIPPET_PACKING = /* wgsl */ `

fn packNormal(n: vec4f) -> f32 {
  return bitcast<f32>(pack4x8snorm(n));
}

fn unpackNormal(p: f32) -> vec3f {
  let v = unpack4x8snorm(bitcast<u32>(p));
  return normalize(v.xyz);
}

fn packColor8888(color: vec4f) -> f32 {
  return bitcast<f32>(pack4x8unorm(color));
}

fn unpackColor8888(p: f32) -> vec4f {
  return unpack4x8unorm(bitcast<u32>(p));
}
`;
