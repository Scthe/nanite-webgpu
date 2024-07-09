export const FULLSCREEN_TRIANGLE_POSITION = /* wgsl */ `

/** https://www.saschawillems.de/blog/2016/08/13/vulkan-tutorial-on-rendering-a-fullscreen-quad-without-buffers/ */
fn getFullscreenTrianglePosition(vertIdx: u32) -> vec4f {
  let outUV = vec2u((vertIdx << 1) & 2, vertIdx & 2);
  return vec4f(vec2f(outUV) * 2.0 - 1.0, 0.0, 1.0);
}
`;

export function cmdDrawFullscreenTriangle(renderPass: GPURenderPassEncoder) {
  renderPass.draw(3);
}
