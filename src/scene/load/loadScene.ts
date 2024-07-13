import {
  getProfilerTimestamp,
  getDeltaFromTimestampMS,
} from '../../gpuProfiler.ts';
import { STATS } from '../../sys_web/stats.ts';
import { formatBytes, formatNumber } from '../../utils/index.ts';
import { createDebugMeshes } from './createDebugMeshes.ts';
import { NaniteObject } from '../naniteObject.ts';
import { SceneName, SceneObjectName, SCENES } from '../sceneFiles.ts';
import { NaniteInstancesData, createInstancesData } from '../instancesData.ts';
import { ImpostorRenderer } from '../renderImpostors/renderImpostors.ts';
import { DebugMeshes, Scene } from '../scene.ts';
import { createFallbackTexture, createSampler } from '../../utils/textures.ts';
import { DEFAULT_COLOR } from '../../passes/_shaderSnippets/shading.wgsl.ts';
import { loadObject } from './loadObject.ts';
import { ObjectLoadingProgressCb } from './types.ts';
import { CONFIG } from '../../constants.ts';

export type LoadedObject = Awaited<ReturnType<typeof loadObject>>;
export type OnObjectLoadedCb = (a: LoadedObject) => Promise<void>;

export async function loadScene(
  device: GPUDevice,
  sceneName: SceneName,
  progressCb?: ObjectLoadingProgressCb,
  objectLoadedCb?: OnObjectLoadedCb
): Promise<Scene> {
  const sceneObjectDefs = getSceneDef(device, sceneName);

  // fallback texture
  const fallbackDiffuseTexture = createFallbackTexture(device, DEFAULT_COLOR);
  const fallbackDiffuseTextureView = fallbackDiffuseTexture.createView();
  const samplerNearest = createSampler(device, 'nearest');
  const samplerLinear = createSampler(device, 'linear');
  const impostorRenderer = new ImpostorRenderer(
    device,
    fallbackDiffuseTextureView
  );

  let debugMeshes: DebugMeshes | undefined = undefined;
  const naniteObjects: NaniteObject[] = [];
  const start = getProfilerTimestamp();

  // enable dev tools profiler
  const { enableProfiler } = CONFIG.nanite.preprocess;
  if (enableProfiler) {
    console.profile('scene-loading');
  }

  for (let i = 0; i < sceneObjectDefs.length; i++) {
    const objDef = sceneObjectDefs[i];
    const obj = await loadObject(
      device,
      objDef.model,
      objDef.instances,
      impostorRenderer,
      progressCb
    );
    naniteObjects.push(obj.naniteObject);
    await objectLoadedCb?.(obj);

    // create debug meshes if needed
    if (debugMeshes == undefined) {
      debugMeshes = await createDebugMeshes(
        device,
        obj.originalMesh,
        obj.parsedMesh
      );
    }
  }

  // finish dev tools profiler
  if (enableProfiler) {
    console.profileEnd();
  }

  ensureUniqueNames(naniteObjects);

  // update stats
  const delta = getDeltaFromTimestampMS(start);
  STATS.update('Preprocessing', `${delta.toFixed(0)}ms`);
  const stats = updateSceneStats(naniteObjects);

  return {
    naniteObjects,
    // TODO verify debugMeshes also works
    debugMeshes: debugMeshes!, // was created from first nanite object
    fallbackDiffuseTexture,
    fallbackDiffuseTextureView,
    samplerNearest,
    samplerLinear,
    ...stats,
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
  let maxSimplifiedTriangles = 0;
  // memory - data
  let indexBufferBytes = 0;
  let meshletsDataBytes = 0;
  let instancesTfxBytes = 0;
  // memory - drawn ids buffers
  let drawnInstancesBytes = 0;
  let drawnImpostorsBytes = 0;
  let drawnMeshletsBytes = 0;

  for (const naniteObj of naniteObjects) {
    naiveTriangleCount +=
      naniteObj.bottomTriangleCount * naniteObj.instancesCount;
    naiveMeshletCount +=
      naniteObj.bottomMeshletCount * naniteObj.instancesCount;
    totalInstancesCount += naniteObj.instancesCount;
    maxSimplifiedTriangles +=
      naniteObj.roots.reduce((acc, m) => acc + m.triangleCount, 0) *
      naniteObj.instancesCount;

    indexBufferBytes += naniteObj.buffers.indexBuffer.size;
    meshletsDataBytes += naniteObj.buffers.meshletsDataBuffer.size;
    instancesTfxBytes += naniteObj.instances.transformsBuffer.size;
    // drawn
    drawnInstancesBytes += naniteObj.buffers.drawnInstancesBuffer.size;
    drawnImpostorsBytes += naniteObj.buffers.drawnImpostorsBuffer.size;
    drawnMeshletsBytes += naniteObj.buffers.drawnMeshletsBuffer.size;
  }

  // memory
  STATS.update('Index buffer', formatBytes(indexBufferBytes));
  STATS.update('Meshlets data', formatBytes(meshletsDataBytes));
  STATS.update('Instance tfxs', formatBytes(instancesTfxBytes));
  STATS.update('Drawn instances', formatBytes(drawnInstancesBytes));
  STATS.update('Drawn impostors', formatBytes(drawnImpostorsBytes));
  STATS.update('Drawn meshlets', formatBytes(drawnMeshletsBytes));
  // geometry
  STATS.update('Scene meshlets', formatNumber(naiveMeshletCount, 1));
  STATS.update('Scene triangles', formatNumber(naiveTriangleCount, 1));

  const avgSimpl = (100.0 * maxSimplifiedTriangles) / naiveTriangleCount;
  console.log(`Avg scene simplification is ${avgSimpl.toFixed(1)}% (${formatNumber(naiveTriangleCount)} -> ${formatNumber(maxSimplifiedTriangles)} triangles)`); // prettier-ignore

  return {
    naiveTriangleCount,
    naiveMeshletCount,
    totalInstancesCount,
  };
}

function getSceneDef(
  device: GPUDevice,
  sceneName: SceneName
): Array<{ model: SceneObjectName; instances: NaniteInstancesData }> {
  const sceneObjectDefs = SCENES[sceneName];
  const errMsg = `Scene '${sceneName}' is empty`;
  if (!sceneObjectDefs) {
    throw new Error(`Scene '${sceneName}' is empty`);
  }

  // each object has own instance grid
  if (Array.isArray(sceneObjectDefs)) {
    if (sceneObjectDefs.length < 1) throw new Error(errMsg);

    return sceneObjectDefs.map((objDef) => {
      const instances = createInstancesData(
        device,
        objDef.model,
        objDef.instances
      );
      return {
        model: objDef.model,
        instances,
      };
    });
  }

  // shared instances grid between all objects
  const { models, instances } = sceneObjectDefs;
  const instancesGPU = createInstancesData(device, sceneName, instances);
  return models.map((model) => ({ model, instances: instancesGPU }));
}

function ensureUniqueNames(naniteObjs: NaniteObject[]) {
  const pastNames = new Set<string>();

  naniteObjs.forEach((obj, i) => {
    while (pastNames.has(obj.name)) {
      obj.name += i;
    }
  });
}
