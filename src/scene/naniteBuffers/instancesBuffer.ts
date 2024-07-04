///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_INSTANCES = (bindingIdx: number) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, read> _instanceTransforms: array<mat4x4<f32>>;

fn _getInstanceTransform(idx: u32) -> mat4x4<f32> {
  return _instanceTransforms[idx];
}

fn _getInstanceCount() -> u32 {
  return arrayLength(&_instanceTransforms);
}
`;
