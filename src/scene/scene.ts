import { CONFIG } from '../constants.ts';
import {
  getProfilerTimestamp,
  getDeltaFromTimestampMS,
} from '../gpuProfiler.ts';
import { createNaniteMeshlets } from '../meshPreprocessing/index.ts';
import { STATS } from '../sys_web/stats.ts';
import {
  getVertexCount,
  getTriangleCount,
  formatBytes,
  formatNumber,
} from '../utils/index.ts';
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
  naniteObjects: NaniteObject[];
  debugMeshes: DebugMeshes;
  fallbackDiffuseTexture: GPUTexture;
  fallbackDiffuseTextureView: GPUTextureView;
  defaultSampler: GPUSampler;

  // stats
  /** Triangle count as imported from .OBJ file. This is how much you would render if you did not have nanite */
  naiveTriangleCount: number;
  /** Bottom-level meshlets. We don't want to render them, we want something higher-up the LOD tree to reduce triangle count */
  naiveMeshletCount: number;
  /** Sum of instance count over all objects */
  totalInstancesCount: number;
}

export function getDebugTestObject(scene: Scene): [DebugMeshes, NaniteObject] {
  return [scene.debugMeshes, scene.naniteObjects[0]];
}

export const getDiffuseTexture = (scene: Scene, naniteObject: NaniteObject) =>
  naniteObject.diffuseTextureView || scene.fallbackDiffuseTextureView;

export async function loadScene(
  device: GPUDevice,
  objTextReaderFn: FileTextReader,
  sceneName: SceneName,
  progressCb?: ObjectLoadingProgressCb
): Promise<Scene> {
  const sceneObjectDefs = SCENES[sceneName];
  if (!sceneObjectDefs || sceneObjectDefs.length < 1) {
    throw new Error(`Scene '${sceneName}' is empty`);
  }

  let debugMeshes: DebugMeshes | undefined = undefined;
  const naniteObjects: NaniteObject[] = [];
  const start = getProfilerTimestamp();

  for (let i = 0; i < sceneObjectDefs.length; i++) {
    const objDef = sceneObjectDefs[i];
    const obj = await loadObject(
      device,
      objTextReaderFn,
      objDef.model,
      objDef.instances,
      progressCb
    );
    naniteObjects.push(obj.naniteObject);

    // create debug meshes if needed
    if (debugMeshes == undefined) {
      debugMeshes = await createDebugMeshes(
        device,
        obj.originalMesh,
        obj.parsedMesh
      );
    }
  }

  // update stats
  const delta = getDeltaFromTimestampMS(start);
  STATS.update('Preprocessing', `${delta.toFixed(0)}ms`);

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

  const stats = updateSceneStats(naniteObjects);

  return {
    naniteObjects,
    debugMeshes: debugMeshes!, // was created from first nanite object
    fallbackDiffuseTexture,
    fallbackDiffuseTextureView,
    defaultSampler,
    ...stats,
  };
}

async function loadObject(
  device: GPUDevice,
  objTextReaderFn: FileTextReader,
  name: SceneObjectName,
  instancesDesc: InstancesGrid,
  progressCb?: ObjectLoadingProgressCb
) {
  console.group(`Object '${name}'`);
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
  addTimer('---TOTAL---', start);
  console.log(`Object '${name}' loaded. Timers:`, timers);
  if (enableProfiler) {
    console.profileEnd();
  }
  console.groupEnd();

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

function updateSceneStats(
  naniteObjects: NaniteObject[]
): Pick<
  Scene,
  'naiveMeshletCount' | 'naiveTriangleCount' | 'totalInstancesCount'
> {
  // geometry
  let naiveTriangleCount = 0;
  let naiveMeshletCount = 0;
  let totalInstancesCount = 0;
  // memory
  let meshletsDataBytes = 0;
  let visibilityBufferBytes = 0;
  let indexBufferBytes = 0;

  for (const naniteObj of naniteObjects) {
    naiveTriangleCount +=
      naniteObj.rawObjectTriangleCount * naniteObj.instancesCount;
    naiveMeshletCount += naniteObj.rawMeshletCount * naniteObj.instancesCount;
    totalInstancesCount += naniteObj.instancesCount;

    meshletsDataBytes += naniteObj.meshletsBuffer.size;
    visibilityBufferBytes += naniteObj.dangerouslyGetVisibilityBuffer().size;
    indexBufferBytes += naniteObj.indexBuffer.size;
  }

  STATS.update('Index buffer', formatBytes(indexBufferBytes));
  STATS.update('Meshlets data', formatBytes(meshletsDataBytes));
  STATS.update('Visibility buffer', formatBytes(visibilityBufferBytes));
  STATS.update('Scene meshlets', formatNumber(naiveMeshletCount, 1));
  STATS.update('Scene triangles', formatNumber(naiveTriangleCount, 1));

  return {
    naiveTriangleCount,
    naiveMeshletCount,
    totalInstancesCount,
  };
}
