import { CONFIG, MODELS_DIR } from '../../constants.ts';
import {
  getProfilerTimestamp,
  getDeltaFromTimestampMS,
} from '../../gpuProfiler.ts';
import { createNaniteMeshlets } from '../../meshPreprocessing/index.ts';
import { getVertexCount, getTriangleCount } from '../../utils/index.ts';
import { printBoundingBox } from '../../utils/calcBounds.ts';
import { createNaniteObject } from './createNaniteObject.ts';
import { ParsedMesh, loadObjFile } from '../objLoader.ts';
import {
  SceneObjectName,
  getSceneObjectDef,
  SceneObjectDef,
} from '../sceneFiles.ts';
import { NaniteInstancesData } from '../instancesData.ts';
import { ImpostorRenderer } from '../renderImpostors/renderImpostors.ts';
import { createOriginalMesh } from './createOriginalMesh.ts';
import { ObjectLoadingProgressCb } from './types.ts';
import { importFromFile } from '../import-export/import-export.ts';
import { GPUOriginalMesh } from '../GPUOriginalMesh.ts';

export interface ObjectLoaderParams {
  name: SceneObjectName;
  objectDef: SceneObjectDef;
  device: GPUDevice;
  instances: NaniteInstancesData;
  impostorRenderer: ImpostorRenderer;
  diffuseTextureView: GPUTextureView | undefined;
  progressCb?: ObjectLoadingProgressCb;
  start: number;
  addTimer: (name: string, start: number) => void;
}

type Result = Awaited<ReturnType<typeof loadObjectObj>>;

export async function loadObject(
  device: GPUDevice,
  name: SceneObjectName,
  instances: NaniteInstancesData,
  impostorRenderer: ImpostorRenderer,
  progressCb?: ObjectLoadingProgressCb
): Promise<Result> {
  console.groupCollapsed(`Object '${name}'`);
  await progressCb?.(name, `Loading object: '${name}'`);
  const start = getProfilerTimestamp();
  const timers: string[] = [];
  const addTimer = (name: string, start: number) =>
    timers.push(`${name}: ${getDeltaFromTimestampMS(start).toFixed(2)}ms`);

  // get file text
  const objectDef = getSceneObjectDef(name);
  const fileText = await CONFIG.loaders.textFileReader(
    `${MODELS_DIR}/${objectDef.file}`
  );
  addTimer('File content fetch', start);

  // load texture if needed
  // Do it now so it fails early if you have typo in the path
  const tex = await loadObjectTexture(
    device,
    addTimer,
    // deno-lint-ignore no-explicit-any
    (objectDef as any)['texture']
  );

  const params: ObjectLoaderParams = {
    name,
    objectDef,
    device,
    instances,
    impostorRenderer,
    progressCb,
    addTimer,
    start,
    diffuseTextureView: tex.diffuseTextureView,
  };

  const isJson = objectDef.file.endsWith('.json');
  const result: Result = await (isJson
    ? importFromFile(params, fileText)
    : loadObjectObj(params, fileText));

  // assign textures
  result.naniteObject.diffuseTexture = tex.diffuseTexture;
  result.naniteObject.diffuseTextureView = tex.diffuseTextureView;

  // end
  addTimer('---TOTAL---', start);
  console.log(`Object '${name}' loaded. Timers:`, timers);
  console.groupEnd();

  return result;
}

async function loadObjectObj(params: ObjectLoaderParams, objFileText: string) {
  const { device, instances, name, objectDef, progressCb, addTimer } = params;

  // parse OBJ file
  let timerStart = getProfilerTimestamp();
  const loadedObj = await loadObjFile(objFileText, objectDef.scale);
  addTimer('OBJ parsing', timerStart);
  // prettier-ignore
  console.log(`Object '${name}': ${getVertexCount(loadedObj.positions)} vertices, ${getTriangleCount(loadedObj.indices)} triangles`);
  printBoundingBox(loadedObj.positions);

  // create original mesh
  const originalMesh = createOriginalMesh(device, name, loadedObj);

  // Nanite preprocess: create meshlet LOD hierarchy
  timerStart = getProfilerTimestamp();
  const naniteMeshlets = await createNaniteMeshlets(
    loadedObj,
    loadedObj.indices,
    progressCb != undefined ? (p) => progressCb(name, p) : undefined
  );
  addTimer('Nanite LOD tree build', timerStart);

  // create impostors
  const impostors = await createImpostors(
    params,
    name,
    originalMesh,
    loadedObj
  );

  // create nanite object
  await progressCb?.(name, `Uploading '${name}' data to the GPU`);
  timerStart = getProfilerTimestamp();
  const naniteObject = createNaniteObject(
    device,
    name,
    originalMesh,
    loadedObj,
    naniteMeshlets,
    instances,
    impostors
  );
  addTimer('Finalize nanite object', timerStart);

  return {
    originalMesh,
    parsedMesh: loadedObj,
    naniteObject,
  };
}

export async function createImpostors(
  params: ObjectLoaderParams,
  name: SceneObjectName,
  originalMesh: GPUOriginalMesh,
  parsedMesh: ParsedMesh
) {
  const { device, impostorRenderer, progressCb, addTimer, diffuseTextureView } =
    params;

  await progressCb?.(name, `Creating impostors`);
  const timerStart = getProfilerTimestamp();
  const impostor = impostorRenderer.createImpostorTexture(device, {
    name,
    vertexBuffer: originalMesh.vertexBuffer,
    normalsBuffer: originalMesh.normalsBuffer,
    uvBuffer: originalMesh.uvBuffer,
    indexBuffer: originalMesh.indexBuffer,
    triangleCount: originalMesh.triangleCount,
    bounds: parsedMesh.bounds.sphere,
    texture: diffuseTextureView,
  });
  addTimer('Creating impostors', timerStart);

  return impostor;
}

async function loadObjectTexture(
  device: GPUDevice,
  addTimer: ObjectLoaderParams['addTimer'],
  fileName: string | undefined
) {
  if (!fileName) {
    return { diffuseTexture: undefined, diffuseTextureView: undefined };
  }

  const timerStart = getProfilerTimestamp();

  const texturePath = `${MODELS_DIR}/${fileName}`;
  const usage: GPUTextureUsageFlags =
    GPUTextureUsage.TEXTURE_BINDING |
    GPUTextureUsage.COPY_DST |
    GPUTextureUsage.RENDER_ATTACHMENT;

  const diffuseTexture = await CONFIG.loaders.createTextureFromFile(
    device,
    texturePath,
    'rgba8unorm-srgb',
    usage
  );
  console.log(`Texture: '${texturePath}'`);
  const diffuseTextureView = diffuseTexture.createView();
  addTimer('Load texture', timerStart);

  return { diffuseTexture, diffuseTextureView };
}
