export const SHADER_PARAMS = {
  workgroupSizeX: 8,
  workgroupSizeY: 8,
  bindings: {
    textureSrc: 0,
    textureDst: 1,
  },
};

///////////////////////////
/// SHADER CODE
/// Requires device feature 'float32-filterable'
///////////////////////////
const c = SHADER_PARAMS;
const b = SHADER_PARAMS.bindings;

export const SHADER_CODE = () => /* wgsl */ `

@group(0) @binding(${b.textureSrc})
var _textureSrc: texture_2d<f32>;

@group(0) @binding(${b.textureDst})
var _textureDst: texture_storage_2d<r32float, write>;


@compute
@workgroup_size(${c.workgroupSizeX}, ${c.workgroupSizeY}, 1)
fn main(
  @builtin(global_invocation_id) global_id: vec3<u32>,
) {
  let index = global_id.xy;
  let dimSrc = vec2u(textureDimensions(_textureSrc, 0));

  if (index.x >= dimSrc.x || index.y >= dimSrc.y){
    return;
  }

  // sample
  // TODO textureGather?
  var depth = 0.0;
  let pos = index * 2;
  // max cause we have: depthCompare='less',
  // so everything closer (less depth) will be rendered.
  // "Culled if the closest mesh vertex is still further than depthmap"
  depth = max(depth, textureLoad(_textureSrc, pos                , 0).x);
  depth = max(depth, textureLoad(_textureSrc, pos + vec2u(0u, 1u), 0).x);
  depth = max(depth, textureLoad(_textureSrc, pos + vec2u(1u, 0u), 0).x);
  depth = max(depth, textureLoad(_textureSrc, pos + vec2u(1u, 1u), 0).x);

  // write
  textureStore(_textureDst, index, vec4(depth));
}
`;
