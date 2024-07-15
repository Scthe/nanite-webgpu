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
import {
  ensureTypedArray,
  formatBytes,
  replaceFileExt,
} from '../../utils/index.ts';
import {
  ParsedMesh,
  splitVerticesWithAttributesIntoSeparateLists,
} from '../objLoader.ts';
import { assertValidNaniteObject } from '../utils/assertValidNaniteObject.ts';
import { ObjectLoaderParams, createImpostors } from '../load/loadObject.ts';
import { getProfilerTimestamp } from '../../gpuProfiler.ts';
import {
  BYTES_U32,
  CONFIG,
  MODELS_DIR,
  VERTS_IN_TRIANGLE,
} from '../../constants.ts';

export async function exportToFile(
  device: GPUDevice,
  object: LoadedObject,
  outputPathJson: string,
  outputPathBin: string
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
    exporterVersion: 0,
    name: naniteObject.name,
    bounds: naniteObject.bounds,
    allMeshlets,
    roots: naniteObject.roots.map((n) => n.id),
    lodLevelCount: naniteObject.lodLevelCount,
    parsedMesh: {
      vertexCount: parsedMesh.vertexCount,
      positionsStride: parsedMesh.positionsStride,
      // verticesAndAttributes: parsedMesh.verticesAndAttributes, // binary
      verticesAndAttributesStride: parsedMesh.verticesAndAttributesStride,
      // indices: parsedMesh.indices, // binary
      indicesCount: parsedMesh.indicesCount,
      bounds: parsedMesh.bounds,
    },
    // meshletIndexBufferData, // binary
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
  await Deno.writeTextFile(outputPathJson, str);

  // write binary file
  const fileBin = await Deno.create(outputPathBin);
  const writerBin = fileBin.writable.getWriter();
  console.log(`Writing vertex buffer: ${formatBytes(parsedMesh.verticesAndAttributes.byteLength)}`); // prettier-ignore
  await writeTypedArray(writerBin, parsedMesh.verticesAndAttributes);
  console.log(`Writing original index buffer: ${formatBytes(parsedMesh.indices.byteLength)}`); // prettier-ignore
  await writeTypedArray(writerBin, parsedMesh.indices);
  console.log(`Writing meshlets' index buffer: ${formatBytes(meshletIndexBufferData.byteLength)}`); // prettier-ignore
  await writeTypedArray(writerBin, meshletIndexBufferData);
  await writerBin.close();
}

function writeTypedArray(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  data: Uint32Array | Float32Array
) {
  return writer.write(new Uint8Array(data.buffer));
}

export async function importFromFile(
  params: ObjectLoaderParams,
  jsonText: string
) {
  const { device, instances, name, objectDef, progressCb, addTimer } = params;

  let timerStart = getProfilerTimestamp();
  const jsonObj: SerializedNaniteObject = JSON.parse(jsonText);
  addTimer('JSON parsing', timerStart);

  // read binary file
  const binaryFilePath = replaceFileExt(
    `${MODELS_DIR}/${objectDef.file}`,
    '.bin'
  );
  const binaryFileContent = await readObjectBinaryFile(jsonObj, binaryFilePath);

  // split optimized vertex buffer into per-attribute copies
  const attributes = splitVerticesWithAttributesIntoSeparateLists(
    binaryFileContent.verticesAndAttributes
  );

  // create basic mesh representation
  const parsedMesh: ParsedMesh = {
    ...jsonObj.parsedMesh,
    positions: ensureTypedArray(Float32Array, attributes.positions),
    normals: ensureTypedArray(Float32Array, attributes.normals),
    uv: ensureTypedArray(Float32Array, attributes.uv),
    verticesAndAttributes: ensureTypedArray(
      Float32Array,
      binaryFileContent.verticesAndAttributes
    ),
    indices: ensureTypedArray(Uint32Array, binaryFileContent.indices),
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
  device.queue.writeBuffer(
    naniteObject.buffers.indexBuffer,
    0,
    binaryFileContent.meshletIndices,
    0
  );

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
  naniteObject.lodLevelCount =
    allMeshlets.reduce((acc, m) => Math.max(acc, m.lodLevel), 0) + 1;

  // upload meshlet data to the GPU
  naniteObject.finalizeNaniteObject(device);
  addTimer('Finalize nanite object', timerStart);

  assertValidNaniteObject(naniteObject);

  // print stats
  if (!CONFIG.isTest) {
    naniteObject.printStats();
  }

  return {
    originalMesh,
    parsedMesh,
    naniteObject,
  };
}

async function readObjectBinaryFile(
  jsonObj: SerializedNaniteObject,
  path: string
) {
  const mesh = jsonObj.parsedMesh;
  const verticesBytes = mesh.vertexCount * mesh.verticesAndAttributesStride;
  const indicesBytes = mesh.indicesCount * BYTES_U32;
  const meshletTriangles = jsonObj.allMeshlets.reduce(
    (acc, m) => acc + m.triangleCount,
    0
  );
  const meshletIndicesBytes = meshletTriangles * VERTS_IN_TRIANGLE * BYTES_U32;

  const bytesBuffer = await CONFIG.loaders.binaryFileReader(path);
  let offset = 0;

  // mesh vertex buffer
  const verticesAndAttributes = new Float32Array(
    bytesBuffer.slice(offset, offset + verticesBytes)
  );
  offset += verticesBytes;
  assertByteSize('vertex buffer', verticesAndAttributes, verticesBytes);
  // assertSameBuffer(mesh.verticesAndAttributes, verticesAndAttributes);

  // mesh index buffer
  const indices = new Uint32Array(
    bytesBuffer.slice(offset, offset + indicesBytes)
  );
  offset += indicesBytes;
  assertByteSize('index buffer', indices, indicesBytes);
  // assertSameBuffer(mesh.indices, indices);

  // meshlet index buffer
  const meshletIndices = new Uint32Array(bytesBuffer.slice(offset));
  assertByteSize('meshlet indices buffer', meshletIndices, meshletIndicesBytes);
  /*const jsonData = ensureTypedArray(
    Uint32Array,
    jsonObj.meshletIndexBufferData
  );
  assertSameBuffer(jsonData, meshletIndices);*/

  return { verticesAndAttributes, indices, meshletIndices };
}

function assertByteSize<T extends Uint32Array | Float32Array>(
  type: string,
  data: T,
  expectedBytes: number
) {
  if (data.byteLength !== expectedBytes) {
    throw new ImportError(`Invalid binary ${type}. Expected ${expectedBytes} bytes, got ${data.byteLength}`); // prettier-ignore
  }
}

// deno-lint-ignore no-unused-vars
function assertSameBuffer<T extends Uint32Array | Float32Array>(a: T, b: T) {
  if (a.length !== b.length) {
    throw new Error(`Different length: ${a.length} vs ${b.length}`);
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      throw new Error(`Different data at idx=${i}: ${a[i]} vs ${b[i]}`);
    }
  }
}
