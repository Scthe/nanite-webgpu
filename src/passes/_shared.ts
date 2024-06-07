import { DEPTH_FORMAT } from '../constants.ts';

type PassClass = { NAME: string; SHADER_CODE: string };

export const labelShader = (pass: PassClass) => `${pass.NAME}-shaders`;
export const labelPipeline = (pass: PassClass) => `${pass.NAME}-pipeline`;

export const assertHasShaderCode = (pass: PassClass) => {
  if (!pass.SHADER_CODE || pass.SHADER_CODE.length === 0)
    throw new Error(`Pass '${pass.NAME}' does not contain SHADER_CODE`);
};

export const PIPELINE_PRIMITIVE_TRIANGLE_LIST: GPUPrimitiveState = {
  cullMode: 'none', // TODO culling?
  topology: 'triangle-list',
  stripIndexFormat: undefined,
};

export const PIPELINE_DEPTH_STENCIL_ON: GPUDepthStencilState = {
  depthWriteEnabled: true,
  depthCompare: 'less',
  format: DEPTH_FORMAT,
};

export const assignResourcesToBindings = (
  device: GPUDevice,
  renderPipeline: GPURenderPipeline,
  entries: GPUBindGroupEntry[]
) => {
  const uniformsLayout = renderPipeline.getBindGroupLayout(0);
  return device.createBindGroup({
    layout: uniformsLayout,
    entries,
  });
};

export const useColorAttachment = (
  colorTexture: GPUTexture,
  loadOp: GPULoadOp,
  clearColor: number[]
): GPURenderPassColorAttachment => ({
  view: colorTexture.createView(),
  loadOp,
  storeOp: 'store',
  clearValue: [clearColor[0], clearColor[1], clearColor[2], 1],
});

export const useDepthStencilAttachment = (
  depthTexture: GPUTexture
): GPURenderPassDepthStencilAttachment => ({
  view: depthTexture.createView(),
  depthClearValue: 1.0,
  depthLoadOp: 'clear',
  depthStoreOp: 'store',
});
