import { DEPTH_FORMAT } from '../constants.ts';

type Pass = { NAME: string };

export const labelShader = (pass: Pass) => `${pass.NAME}-shaders`;
export const labelPipeline = (pass: Pass) => `${pass.NAME}-pipeline`;

export const PIPELINE_PRIMITIVE_TRIANGLE_LIST: GPUPrimitiveState = {
  cullMode: 'none',
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
