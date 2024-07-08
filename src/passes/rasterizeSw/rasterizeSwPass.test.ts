import {
  assertBinarySnapshot,
  createGpuDevice_TESTS,
  createMockPassCtx,
  mockNaniteObjectBuffers,
  relativePath,
} from '../../sys_deno/testUtils.ts';
import { RasterizeSwPass } from './rasterizeSwPass.ts';
import {
  Dimensions,
  ensureTypedArray,
  f32_to_u8,
  u8_to_f32,
} from '../../utils/index.ts';
import {
  cmdCopyToReadbackBuffer,
  createGPU_StorageBuffer,
  createReadbackBuffer,
  readBufferToCPU,
} from '../../utils/webgpu.ts';
import { writePng } from '../../sys_deno/fakeCanvas.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import {
  NaniteObject,
  NaniteMeshletTreeNode,
} from '../../scene/naniteObject.ts';
import { createInstancesData, createGrid } from '../../scene/instancesData.ts';
import { mat4 } from 'wgpu-matrix';
import {
  createMeshletsDataBuffer,
  uploadMeshletsToGPU,
} from '../../scene/naniteBuffers/meshletsDataBuffer.ts';
import { createDrawnMeshletsBuffer } from '../../scene/naniteBuffers/drawnMeshletsBuffer.ts';
import {
  createOctahedronNormals,
  decodeOctahedronNormal,
} from '../../scene/naniteBuffers/vertexNormalsBuffer.ts';

import '../../lib/meshoptimizer.d.ts'; // TODO ??? remove
import '../../lib/metis.d.ts'; // TODO ??? remove

const RESULT_SIZE: Dimensions = {
  width: 64,
  height: 64,
};
const PREVIEW_PATH_D = relativePath(import.meta, '__test__/test_preview.d.png');
const PREVIEW_PATH_N = relativePath(import.meta, '__test__/test_preview.n.png');
const SNAPSHOT_FILE_D = relativePath(
  import.meta,
  '__test__/ImpostorsRenderer.d.snapshot.bin'
);
const SNAPSHOT_FILE_N = relativePath(
  import.meta,
  '__test__/ImpostorsRenderer.n.snapshot.bin'
);

const OBJ_NAME = 'RasterizeSwPass-obj';

const VERTEX_POSITIONS = [
  [0, 0.5, 0.0, 1.0],
  [-0.75, -0.5, 0.0, 1.0],
  [0.75, -0.5, 0.0, 1.0], // remember: CCW vs CW (ALWAYS USE CCW)
].flat();
const VERTEX_NORMALS = [
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
].flat();
const INDEX_BUFFER = [0, 1, 2];

Deno.test('RasterizeSwPass', async () => {
  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();

  const uniforms = new RenderUniformsBuffer(device);

  const { mockNaniteObject } = createMockNaniteObject(device);

  // pass
  const pass = new RasterizeSwPass(device);
  pass.onViewportResize(device, RESULT_SIZE);

  // result framebuffer as flat buffer
  const resultBuffer = pass.resultBuffer;
  // readback buffer (allows Usage.MAP_READ)
  const resultReadbackBuffer = createReadbackBuffer(device, resultBuffer);

  // submit
  const cmdBuf = device.createCommandEncoder();
  const passCtx = createMockPassCtx(device, cmdBuf);
  passCtx.projMatrix = mat4.identity();
  passCtx.viewMatrix = mat4.identity();
  passCtx.globalUniforms = uniforms;
  passCtx.viewport = RESULT_SIZE;
  uniforms.update(passCtx);
  pass.cmdSoftwareRasterize(passCtx, mockNaniteObject);
  cmdCopyToReadbackBuffer(cmdBuf, resultBuffer, resultReadbackBuffer);
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  // read back
  const resultData = await readBufferToCPU(Uint32Array, resultReadbackBuffer);
  // printTypedArray('resultData', resultData);

  // cleanup
  device.destroy();

  const pixelCount = resultData.length;
  const depthData = new Uint32Array(pixelCount);
  const normalsData = new Uint32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    const data = resultData[i];
    if (data === 0) {
      continue;
    }

    depthData[i] = data >> 16;

    // decode normals
    const nOctahedr = resultData[i] & 0x0000ffff;
    const n = decodeOctahedronNormal(
      u8_to_f32(nOctahedr >> 8), //
      u8_to_f32(nOctahedr)
    );
    normalsData[i] =
      (f32_to_u8(n[0]) << 16) | //
      (f32_to_u8(n[1]) << 8) |
      f32_to_u8(n[2]);
  }

  // const PREVIEW_PATH = relativePath(import.meta, '__test__/test_preview.png');
  // await writePng(resultData.buffer, RESULT_SIZE, PREVIEW_PATH);
  await writePng(depthData.buffer, RESULT_SIZE, PREVIEW_PATH_D);
  await writePng(normalsData.buffer, RESULT_SIZE, PREVIEW_PATH_N);

  await assertBinarySnapshot(SNAPSHOT_FILE_D, depthData.buffer);
  await assertBinarySnapshot(SNAPSHOT_FILE_N, normalsData.buffer);
});

function createMockNaniteObject(device: GPUDevice) {
  const mockBuffers = mockNaniteObjectBuffers();

  // vertex buffer
  mockBuffers.vertexPositionsBuffer = createGPU_StorageBuffer(
    device,
    `${OBJ_NAME}-vertices`,
    ensureTypedArray(Float32Array, VERTEX_POSITIONS)
  );
  mockBuffers.vertexNormalsBuffer = createOctahedronNormals(
    device,
    OBJ_NAME,
    ensureTypedArray(Float32Array, VERTEX_NORMALS)
  );

  // index buffer
  mockBuffers.indexBuffer = createGPU_StorageBuffer(
    device,
    `${OBJ_NAME}-indices`,
    ensureTypedArray(Uint32Array, INDEX_BUFFER)
  );

  // instances
  const mockInstances = createInstancesData(device, OBJ_NAME, createGrid(1, 1));

  // meshlets data
  const bSphere = { center: [0, 0, 0], radius: 1 };
  const meshlet: NaniteMeshletTreeNode = {
    id: 0,
    sharedSiblingsBounds: bSphere,
    maxSiblingsError: 0,
    parentBounds: bSphere,
    parentError: Infinity,
    // deno-lint-ignore no-explicit-any
    ownBounds: { sphere: bSphere } as any,
    triangleCount: 1,
    firstIndexOffset: 0,
    lodLevel: 0,
    createdFrom: [],
  };
  const meshlets = [meshlet];
  mockBuffers.meshletsDataBuffer = createMeshletsDataBuffer(
    device,
    OBJ_NAME,
    meshlets.length
  );
  uploadMeshletsToGPU(device, mockBuffers.meshletsDataBuffer, meshlets);

  // drawn meshlet
  mockBuffers.drawnMeshletsBuffer = createDrawnMeshletsBuffer(
    device,
    OBJ_NAME,
    // deno-lint-ignore no-explicit-any
    meshlets as any,
    mockInstances.count
  );
  mockBuffers._mockMeshletSoftwareDraw(device, new Uint32Array([1, 1, 1, 1]));
  mockBuffers._mockMeshletsDrawList(device, new Uint32Array([0, 0]));

  // nanite object
  const mockNaniteObject: NaniteObject = {
    name: OBJ_NAME,
    buffers: mockBuffers,
    bindInstanceTransforms: (bindingIdx: number): GPUBindGroupEntry => ({
      binding: bindingIdx,
      resource: { buffer: mockInstances.transformsBuffer },
    }),
    // deno-lint-ignore no-explicit-any
  } as any;

  return { mockBuffers, mockNaniteObject };
}
