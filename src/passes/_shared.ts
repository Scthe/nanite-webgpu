import { CONFIG, DEPTH_FORMAT } from '../constants.ts';
import { Scene } from '../scene/scene.ts';
import { STATS } from '../sys_web/stats.ts';
import { formatPercentageNumber } from '../utils/index.ts';

type PassClass = { NAME: string };

export const createLabel = (pass: PassClass, name = '') =>
  `${pass.NAME}${name ? '-' + name : ''}`;

export const labelShader = (pass: PassClass) => `${pass.NAME}-shader`;
export const labelPipeline = (pass: PassClass, name = '') =>
  `${createLabel(pass, name)}-pipeline`;
export const labelUniformBindings = (pass: PassClass, name = '') =>
  `${createLabel(pass, name)}-uniforms`;

export const getClearColorVec3 = () =>
  CONFIG.useAlternativeClearColor ? CONFIG.clearColorAlt : CONFIG.clearColor;

export const PIPELINE_PRIMITIVE_TRIANGLE_LIST: GPUPrimitiveState = {
  cullMode: CONFIG.nanite.render.allowHardwareBackfaceCull ? 'back' : 'none',
  topology: 'triangle-list',
  stripIndexFormat: undefined,
};

export const PIPELINE_DEPTH_STENCIL_ON: GPUDepthStencilState = {
  depthWriteEnabled: true,
  depthCompare: 'less',
  format: DEPTH_FORMAT,
};

export const assignResourcesToBindings2 = (
  pass: PassClass,
  name: string,
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  entries: GPUBindGroupEntry[]
) => {
  const uniformsLayout = pipeline.getBindGroupLayout(0);
  return device.createBindGroup({
    label: labelUniformBindings(pass, name),
    layout: uniformsLayout,
    entries,
  });
};

export const assignResourcesToBindings = (
  pass: PassClass,
  device: GPUDevice,
  pipeline: GPURenderPipeline | GPUComputePipeline,
  entries: GPUBindGroupEntry[]
) => {
  return assignResourcesToBindings2(pass, '', device, pipeline, entries);
};

export const useColorAttachment = (
  colorTexture: GPUTextureView,
  clearColor: number[],
  loadOp: GPULoadOp = 'clear'
): GPURenderPassColorAttachment => ({
  view: colorTexture,
  loadOp,
  storeOp: 'store',
  clearValue: [clearColor[0], clearColor[1], clearColor[2], 1],
});

export const useDepthStencilAttachment = (
  depthTexture: GPUTextureView,
  depthLoadOp: GPULoadOp = 'clear'
): GPURenderPassDepthStencilAttachment => ({
  view: depthTexture,
  depthClearValue: 1.0,
  depthLoadOp,
  depthStoreOp: 'store',
});

export class BindingsCache {
  private cache: Record<string, GPUBindGroup | undefined> = {};

  getBindings(key: string, factory: () => GPUBindGroup): GPUBindGroup {
    const cachedVal = this.cache[key];
    if (cachedVal) {
      return cachedVal;
    }

    const val = factory();
    this.cache[key] = val;
    return val;
  }

  clear() {
    // Object.values(this.cache).forEach((bg) => {
    // bg?.destroy(); // no such fn?
    // });
    this.cache = {};
  }
}

export function resetNaniteStats() {
  STATS.update('Nanite meshlets', '-');
  STATS.update('Nanite triangles', '-');
  STATS.update('Drawn instances', '-');
}

export function setNaniteDrawStats(
  scene: Scene,
  drawnMeshletsCount: number,
  drawnTriangleCount: number | undefined // not always available
) {
  STATS.update(
    'Nanite meshlets',
    formatPercentageNumber(drawnMeshletsCount, scene.naiveMeshletCount)
  );

  if (drawnTriangleCount) {
    STATS.update(
      'Nanite triangles',
      formatPercentageNumber(drawnTriangleCount, scene.naiveTriangleCount)
    );
  }
}

export function setNaniteInstancesStats(
  scene: Scene,
  drawnInstancesCount: number
) {
  STATS.update(
    'Drawn instances',
    formatPercentageNumber(drawnInstancesCount, scene.totalInstancesCount)
  );
}
