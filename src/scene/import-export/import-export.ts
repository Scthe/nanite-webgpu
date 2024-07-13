import { createOriginalMesh } from '../load/createOriginalMesh.ts';
import { LoadedObject } from '../load/loadScene.ts';
import { NaniteObjectBuffers } from '../naniteBuffers/index.ts';
import { NaniteObject } from '../naniteObject.ts';
import { downloadBuffer } from '../../utils/webgpu.ts';
import {
  serializeNode,
  SerializedNaniteObject,
  deserializeNodes,
  ImportError,
} from './types.ts';
import { ensureTypedArray } from '../../utils/index.ts';
import {
  ParsedMesh,
  splitVerticesWithAttributesIntoSeparateLists,
} from '../objLoader.ts';
import { assertValidNaniteObject } from '../utils/assertValidNaniteObject.ts';
import { ObjectLoaderParams, createImpostors } from '../load/loadObject.ts';
import { getProfilerTimestamp } from '../../gpuProfiler.ts';

export async function exportToFile(
  device: GPUDevice,
  object: LoadedObject,
  outputPath: string
) {
  const { naniteObject, parsedMesh } = object;

  const allMeshlets = naniteObject.allMeshlets.map(serializeNode);
  // console.log(allMeshlets);

  const meshletIndexBufferData = await downloadBuffer(
    device,
    Uint32Array,
    naniteObject.buffers.indexBuffer
  );

  const serializedNaniteObj: SerializedNaniteObject = {
    name: naniteObject.name,
    bounds: naniteObject.bounds,
    allMeshlets,
    roots: naniteObject.roots.map((n) => n.id),
    lodLevelCount: naniteObject.lodLevelCount,
    parsedMesh: {
      vertexCount: parsedMesh.vertexCount,
      positionsStride: parsedMesh.positionsStride,
      verticesAndAttributes: parsedMesh.verticesAndAttributes,
      verticesAndAttributesStride: parsedMesh.verticesAndAttributesStride,
      indices: parsedMesh.indices,
      indicesCount: parsedMesh.indicesCount,
      bounds: parsedMesh.bounds,
    },
    meshletIndexBufferData,
  };

  const str = JSON.stringify(serializedNaniteObj, (_key, value) => {
    if (value !== undefined) {
      // console.log(key, getClassName(value));
      if (value instanceof Float32Array || value instanceof Uint32Array) {
        return Array.from(value);
      }
    }
    return value;
  });
  return Deno.writeTextFile(outputPath, str);
}

export async function importFromFile(
  params: ObjectLoaderParams,
  jsonText: string
) {
  const { device, instances, name, progressCb, addTimer } = params;

  let timerStart = getProfilerTimestamp();
  const jsonObj: SerializedNaniteObject = JSON.parse(jsonText);
  addTimer('JSON parsing', timerStart);

  // split optimized vertex buffer into per-attribute copies
  const attributes = splitVerticesWithAttributesIntoSeparateLists(
    jsonObj.parsedMesh.verticesAndAttributes
  );

  // create basic mesh representation
  // prettier-ignore
  const parsedMesh: ParsedMesh = {
    ...jsonObj.parsedMesh,
    positions: ensureTypedArray( Float32Array,attributes.positions), 
    normals: ensureTypedArray( Float32Array,attributes.normals),
    uv: ensureTypedArray( Float32Array,attributes.uv),
    verticesAndAttributes: ensureTypedArray( Float32Array,jsonObj.parsedMesh.verticesAndAttributes),
    indices: ensureTypedArray( Uint32Array,jsonObj.parsedMesh.indices),
  };
  const originalMesh = createOriginalMesh(device, name, parsedMesh);

  // create nanite buffers
  const buffers = new NaniteObjectBuffers(
    device,
    name,
    originalMesh,
    parsedMesh,
    jsonObj.allMeshlets.map((m) => ({
      indices: m.triangleCount * 3,
      lodLevel: m.lodLevel,
    })),
    instances.count
  );

  // create impostors
  const impostors = await createImpostors(
    params,
    name,
    originalMesh,
    parsedMesh
  );

  // create nanite object
  await progressCb?.(name, `Uploading '${name}' data to the GPU`);
  timerStart = getProfilerTimestamp();
  const naniteObject = new NaniteObject(
    name,
    jsonObj.bounds,
    originalMesh,
    buffers,
    impostors,
    instances
  );
  const indicesU32 = ensureTypedArray(
    Uint32Array,
    jsonObj.meshletIndexBufferData
  );
  device.queue.writeBuffer(naniteObject.buffers.indexBuffer, 0, indicesU32, 0);

  // set meshlet data
  const allMeshlets = deserializeNodes(jsonObj.allMeshlets);
  naniteObject.allMeshlets.push(...allMeshlets);
  jsonObj.roots.forEach((id) => {
    const n = allMeshlets.find((n) => n.id === id);
    if (n == undefined) {
      throw new ImportError(`Root node with id='${id}' does not exist`);
    }
    naniteObject.roots.push(n);
  });

  // upload meshlet data to the GPU
  naniteObject.finalizeNaniteObject(device);
  addTimer('Finalize nanite object', timerStart);

  assertValidNaniteObject(naniteObject);
  return {
    originalMesh,
    parsedMesh,
    naniteObject,
  };
}
