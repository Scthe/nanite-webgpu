export const FULLSCREEN_TRIANGLE_POSITION = /* wgsl */ `
const FULLSCREEN_TRIANGLE_POSITIONS = array<vec2f, 3>(
  vec2(-1.0, 3.0),
  vec2(3.0, -1.0),
  vec2(-1.0, -1.0)
);

fn getFullscreenTrianglePosition(vertIdx: u32) -> vec4f {
  return vec4f(FULLSCREEN_TRIANGLE_POSITIONS[vertIdx], 0.0, 1.0);
}
`;

export function cmdDrawFullscreenTriangle(renderPass: GPURenderPassEncoder) {
  renderPass.draw(3);
}
