import { CONFIG } from '../constants.ts';
import {
  getProfilerTimestamp,
  getDeltaFromTimestampMS,
} from '../gpuProfiler.ts';
import { createNaniteMeshlets } from '../meshPreprocessing/index.ts';
import { STATS } from '../sys_web/stats.ts';
import { getVertexCount, getTriangleCount } from '../utils/index.ts';
import { printBoundingBox } from '../utils/calcBounds.ts';
import {
  createGPU_VertexBuffer,
  createGPU_IndexBuffer,
} from '../utils/webgpu.ts';
import { createNaniteObject } from './createNaniteObject.ts';
import { DebugMeshes, GPUMesh, createDebugMeshes } from './debugMeshes.ts';
import { NaniteObject } from './naniteObject.ts';
import { ParsedMesh, loadObjFile } from './objLoader.ts';
import {
  SceneName,
  SceneObjectName,
  InstancesGrid,
  SCENES,
  OBJECTS,
  MODELS_DIR,
} from './sceneFiles.ts';
import {
  createFallbackTexture,
  createTextureFromFile,
} from '../utils/textures.ts';
import { DEFAULT_COLOR } from '../passes/_shaderSnippets/shading.wgsl.ts';

export type FileTextReader = (filename: string) => Promise<string>;

/** Progress [0..1] or status */
export type ObjectLoadingProgressCb = (
  name: string,
  msg: number | string
) => Promise<void>;

export interface Scene {
  naniteObject: NaniteObject;
  debugMeshes: DebugMeshes;
  fallbackDiffuseTexture: GPUTexture;
  fallbackDiffuseTextureView: GPUTextureView;
  defaultSampler: GPUSampler;
}

export const getDiffuseTexture = (scene: Scene, naniteObject: NaniteObject) =>
  naniteObject.diffuseTextureView || scene.fallbackDiffuseTextureView;

export async function loadScene(
  device: GPUDevice,
  objTextReaderFn: FileTextReader,
  sceneName: SceneName,
  progressCb?: ObjectLoadingProgressCb
): Promise<Scene> {
  const scene = SCENES[sceneName];

  const objDef = scene[0];
  const obj = await loadObject(
    device,
    objTextReaderFn,
    objDef.model,
    objDef.instances,
    progressCb
  );

  // create debug meshes if needed
  const debugMeshes = await createDebugMeshes(
    device,
    obj.originalMesh,
    obj.parsedMesh
  );

  // fallback texture
  const fallbackDiffuseTexture = createFallbackTexture(device, DEFAULT_COLOR);
  const fallbackDiffuseTextureView = fallbackDiffuseTexture.createView();
  const defaultSampler = device.createSampler({
    label: 'default-sampler',
    magFilter: 'nearest',
    minFilter: 'nearest',
    mipmapFilter: 'nearest',
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
  });

  return {
    naniteObject: obj.naniteObject,
    debugMeshes,
    fallbackDiffuseTexture,
    fallbackDiffuseTextureView,
    defaultSampler,
  };
}

async function loadObject(
  device: GPUDevice,
  objTextReaderFn: FileTextReader,
  name: SceneObjectName,
  instancesDesc: InstancesGrid,
  progressCb?: ObjectLoadingProgressCb
) {
  await progressCb?.(name, `Loading object: '${name}'`);
  const start = getProfilerTimestamp();
  const timers: string[] = [];
  const addTimer = (name: string, start: number) =>
    timers.push(`${name}: ${getDeltaFromTimestampMS(start).toFixed(2)}ms`);

  // enable dev tools
  const { enableProfiler } = CONFIG.nanite.preprocess;
  if (enableProfiler) {
    console.profile('scene-loading');
  }

  // get OBJ file text
  const modelDesc = OBJECTS[name];
  const objFileText = await objTextReaderFn(`${MODELS_DIR}/${modelDesc.file}`);
  addTimer('OBJ fetch', start);

  // parse OBJ file
  let timerStart = getProfilerTimestamp();
  const loadedObj = await loadObjFile(objFileText, modelDesc.scale);
  addTimer('OBJ parsing', timerStart);
  // prettier-ignore
  console.log(`Object '${name}': ${getVertexCount(loadedObj.positions)} vertices, ${getTriangleCount(loadedObj.indices)} triangles`);
  printBoundingBox(loadedObj.positions);

  // load texture if needed
  // Do it now so it fails early if you have typo in the path
  let diffuseTexture: GPUTexture | undefined = undefined;
  let diffuseTextureView: GPUTextureView | undefined = undefined;
  if ('texture' in modelDesc) {
    timerStart = getProfilerTimestamp();
    diffuseTexture = await createTextureFromFile(
      device,
      `${MODELS_DIR}/${modelDesc.texture}`
    );
    diffuseTextureView = diffuseTexture.createView();
    addTimer('Load texture', timerStart);
  }

  // create original mesh
  const originalMesh = createOriginalMesh(device, name, loadedObj);

  timerStart = getProfilerTimestamp();
  const naniteMeshlets = await createNaniteMeshlets(
    loadedObj,
    loadedObj.indices,
    progressCb != undefined ? (p) => progressCb(name, p) : undefined
  );
  addTimer('Nanite LOD tree build', timerStart);

  // create nanite object
  await progressCb?.(name, `Uploading '${name}' data to the GPU`);
  timerStart = getProfilerTimestamp();
  const naniteObject = createNaniteObject(
    device,
    name,
    originalMesh,
    loadedObj,
    naniteMeshlets,
    instancesDesc
  );
  naniteObject.diffuseTexture = diffuseTexture;
  naniteObject.diffuseTextureView = diffuseTextureView;
  addTimer('Finalize nanite object', timerStart);

  // end
  const delta = getDeltaFromTimestampMS(start);
  addTimer('---TOTAL---', start);
  STATS.update('Preprocessing', `${delta.toFixed(0)}ms`);
  console.log(`Object '${name}' loaded. Timers:`, timers);
  if (enableProfiler) {
    console.profileEnd();
  }

  return {
    originalMesh,
    parsedMesh: loadedObj,
    naniteObject,
  };
}

function createOriginalMesh(
  device: GPUDevice,
  sceneName: string,
  mesh: ParsedMesh
): GPUMesh {
  const vertexBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-vertices`,
    mesh.positions
  );
  const normalsBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-normals`,
    mesh.normals
  );
  const uvBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-uvs`,
    mesh.uv,
    GPUBufferUsage.STORAGE
  );
  const indexBuffer = createGPU_IndexBuffer(
    device,
    `${sceneName}-original-indices`,
    mesh.indices
  );
  return {
    indexBuffer,
    uvBuffer,
    normalsBuffer,
    vertexBuffer,
    vertexCount: getVertexCount(mesh.positions),
    triangleCount: getTriangleCount(mesh.indices),
  };
}
