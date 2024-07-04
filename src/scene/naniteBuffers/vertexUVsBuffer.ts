///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_VERTEX_UVS = (bindingIdx: number) => /* wgsl */ `

@group(0) @binding(${bindingIdx})
var<storage, read> _vertexUV: array<vec2f>;

fn _getVertexUV(idx: u32) -> vec2f { return _vertexUV[idx]; }
`;
