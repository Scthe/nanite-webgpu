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
  printBoundingBox,
} from '../utils/index.ts';
import {
  createGPU_VertexBuffer,
  createGPU_IndexBuffer,
} from '../utils/webgpu.ts';
import { createNaniteObject } from './createNaniteObject.ts';
import { DebugMeshes, Mesh, createDebugMeshes } from './debugMeshes.ts';
import { NaniteObject } from './naniteObject.ts';
import { loadObjFile } from './objLoader.ts';
import {
  SceneName,
  SceneObjectName,
  InstancesGrid,
  SCENES,
  OBJECTS,
} from './sceneFiles.ts';

export type FileTextReader = (filename: string) => Promise<string>;

export interface Scene {
  naniteObject: NaniteObject;
  debugMeshes: DebugMeshes;
}

export async function loadScene(
  device: GPUDevice,
  objTextReaderFn: FileTextReader,
  sceneName: SceneName
): Promise<Scene> {
  const scene = SCENES[sceneName];

  const objDef = scene[0];
  const obj = await loadObject(
    device,
    objTextReaderFn,
    objDef.model,
    objDef.instances
  );

  // create debug meshes if needed
  const debugMeshes = await createDebugMeshes(
    device,
    obj.originalMesh,
    obj.originalVertices,
    obj.originalIndices
  );

  return { naniteObject: obj.naniteObject, debugMeshes };
}

async function loadObject(
  device: GPUDevice,
  objTextReaderFn: FileTextReader,
  name: SceneObjectName,
  instancesDesc: InstancesGrid
) {
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
  const objFileText = await objTextReaderFn(modelDesc.file);
  addTimer('OBJ fetch', start);

  // parse OBJ file
  let timerStart = getProfilerTimestamp();
  const [originalVertices, originalIndices] = await loadObjFile(
    objFileText,
    modelDesc.scale
  );
  addTimer('OBJ parsing', timerStart);
  // prettier-ignore
  console.log(`Object '${name}': ${getVertexCount(originalVertices)} vertices, ${getTriangleCount(originalIndices)} triangles`);
  printBoundingBox(originalVertices);

  // create original mesh
  const originalMesh = createOriginalMesh(
    device,
    name,
    originalVertices,
    originalIndices
  );

  // create nanite object
  timerStart = getProfilerTimestamp();
  const naniteMeshlets = await createNaniteMeshlets(
    originalVertices,
    originalIndices
  );
  const naniteObject = createNaniteObject(
    device,
    name,
    originalMesh.vertexBuffer,
    originalVertices,
    naniteMeshlets,
    instancesDesc
  );
  addTimer('Nanite LOD build', timerStart);

  // end
  const delta = getDeltaFromTimestampMS(start);
  addTimer('---TOTAL---', start);
  STATS.update('Preprocessing', `${delta.toFixed(0)}ms`);
  console.log(`Object '${name}' loaded. Timers:`, timers);
  if (enableProfiler) {
    console.profileEnd();
  }

  return { originalMesh, originalVertices, originalIndices, naniteObject };
}

function createOriginalMesh(
  device: GPUDevice,
  sceneName: string,
  vertices: Float32Array,
  indices: Uint32Array
): Mesh {
  const vertexBuffer = createGPU_VertexBuffer(
    device,
    `${sceneName}-original-vertices`,
    vertices
  );
  const indexBuffer = createGPU_IndexBuffer(
    device,
    `${sceneName}-original-indices`,
    indices
  );
  return {
    indexBuffer,
    vertexBuffer,
    vertexCount: getVertexCount(vertices),
    triangleCount: getTriangleCount(indices),
  };
}
