import { CONFIG } from '../../constants.ts';
import {
  getProfilerTimestamp,
  getDeltaFromTimestampMS,
} from '../../gpuProfiler.ts';
import { createNaniteMeshlets } from '../../meshPreprocessing/index.ts';
import { getVertexCount, getTriangleCount } from '../../utils/index.ts';
import { printBoundingBox } from '../../utils/calcBounds.ts';
import { createNaniteObject } from './createNaniteObject.ts';
import { loadObjFile } from '../objLoader.ts';
import { SceneObjectName, OBJECTS, MODELS_DIR } from '../sceneFiles.ts';
import { NaniteInstancesData } from '../instancesData.ts';
import { ImpostorRenderer } from '../renderImpostors/renderImpostors.ts';
import { createOriginalMesh } from './createOriginalMesh.ts';
import { ObjectLoadingProgressCb } from './types.ts';

export async function loadObject(
  device: GPUDevice,
  name: SceneObjectName,
  instances: NaniteInstancesData,
  impostorRenderer: ImpostorRenderer,
  progressCb?: ObjectLoadingProgressCb
) {
  console.groupCollapsed(`Object '${name}'`);
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
  const objTextReaderFn = CONFIG.loaders.textFileReader;
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
    const texturePath = `${MODELS_DIR}/${modelDesc.texture}`;
    const usage: GPUTextureUsageFlags =
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT;

    diffuseTexture = await CONFIG.loaders.createTextureFromFile(
      device,
      texturePath,
      'rgba8unorm-srgb',
      usage
    );
    console.log(`Texture: '${texturePath}'`);
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
  // Step 1: impostors
  const impostor = impostorRenderer.createImpostorTexture(device, {
    name,
    vertexBuffer: originalMesh.vertexBuffer,
    normalsBuffer: originalMesh.normalsBuffer,
    uvBuffer: originalMesh.uvBuffer,
    indexBuffer: originalMesh.indexBuffer,
    triangleCount: originalMesh.triangleCount,
    bounds: loadedObj.bounds.sphere,
    texture: diffuseTextureView,
  });
  // Step 2: nanite object itself
  const naniteObject = createNaniteObject(
    device,
    name,
    originalMesh,
    loadedObj,
    naniteMeshlets,
    instances,
    impostor
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
