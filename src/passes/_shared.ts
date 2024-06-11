import { DEPTH_FORMAT } from '../constants.ts';

type PassClass = { NAME: string; SHADER_CODE: string };

export const labelShader = (pass: PassClass) => `${pass.NAME}-shader`;
export const labelPipeline = (pass: PassClass) => `${pass.NAME}-pipeline`;
export const labelUniformBindings = (pass: PassClass) =>
  `${pass.NAME}-uniform-bindings`;

export const assertHasShaderCode = (pass: PassClass) => {
  if (!pass.SHADER_CODE || pass.SHADER_CODE.length === 0)
    throw new Error(`Pass '${pass.NAME}' does not contain SHADER_CODE`);
};

export const PIPELINE_PRIMITIVE_TRIANGLE_LIST: GPUPrimitiveState = {
  cullMode: 'none', // this should be 'back', but if some model has wrong winding I refuse to spend hours debugging thinking it's disappearing meshlet
  topology: 'triangle-list',
  stripIndexFormat: undefined,
};

export const PIPELINE_DEPTH_STENCIL_ON: GPUDepthStencilState = {
  depthWriteEnabled: true,
  depthCompare: 'less',
  format: DEPTH_FORMAT,
};

export const assignResourcesToBindings = (
  pass: PassClass,
  device: GPUDevice,
  renderPipeline: GPURenderPipeline,
  entries: GPUBindGroupEntry[]
) => {
  const uniformsLayout = renderPipeline.getBindGroupLayout(0);
  return device.createBindGroup({
    label: labelUniformBindings(pass),
    layout: uniformsLayout,
    entries,
  });
};

export const useColorAttachment = (
  colorTexture: GPUTextureView,
  loadOp: GPULoadOp,
  clearColor: number[]
): GPURenderPassColorAttachment => ({
  view: colorTexture,
  loadOp,
  storeOp: 'store',
  clearValue: [clearColor[0], clearColor[1], clearColor[2], 1],
});

export const useDepthStencilAttachment = (
  depthTexture: GPUTextureView
): GPURenderPassDepthStencilAttachment => ({
  view: depthTexture,
  depthClearValue: 1.0,
  depthLoadOp: 'clear',
  depthStoreOp: 'store',
});
