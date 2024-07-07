import {
  createGpuDevice_TESTS,
  createMockPassCtx,
  mockNaniteObjectBuffers,
  relativePath,
} from '../../sys_deno/testUtils.ts';
import { RasterizeSwPass } from './rasterizeSwPass.ts';
import { Dimensions, ensureTypedArray } from '../../utils/index.ts';
import {
  cmdCopyToReadbackBuffer,
  createGPU_StorageBuffer,
  createReadbackBuffer,
  readBufferToCPU,
} from '../../utils/webgpu.ts';
import { writePng } from '../../sys_deno/fakeCanvas.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';

import '../../lib/meshoptimizer.d.ts'; // TODO ??? remove
import '../../lib/metis.d.ts'; // TODO ??? remove

const RESULT_SIZE: Dimensions = {
  width: 64,
  height: 64,
};
const PREVIEW_PATH = relativePath(import.meta, '__test__/test_preview.png');
const OBJ_NAME = 'RasterizeSwPass-obj';

const VERTEX_POSITIONS = [
  [0, 0.5, 0.0, 1.0],
  [0.75, -0.5, 0.0, 1.0], // remember: CCW vs CW (ALWAYS USE CW)
  [-0.75, -0.5, 0.0, 1.0],
].flat();
const INDEX_BUFFER = [0, 1, 2];

// TODO actually add an assertion
Deno.test('RasterizeSwPass', async () => {
  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();

  const uniforms = new RenderUniformsBuffer(device);

  // mock nanite buffers
  const mockBuffers = mockNaniteObjectBuffers();
  mockBuffers.vertexPositionsBuffer = createGPU_StorageBuffer(
    device,
    `${OBJ_NAME}-vertices`,
    ensureTypedArray(Float32Array, VERTEX_POSITIONS)
  );
  mockBuffers.indexBuffer = createGPU_StorageBuffer(
    device,
    `${OBJ_NAME}-indices`,
    ensureTypedArray(Uint32Array, INDEX_BUFFER)
  );

  // nanite object
  const mockNaniteObject: NaniteObject = {
    name: OBJ_NAME,
    buffers: mockBuffers,
    // bindInstanceTransforms: (bindingIdx: number): GPUBindGroupEntry => ({
    // binding: bindingIdx,
    // resource: { buffer: mockInstances.transformsBuffer },
    // }),
    // deno-lint-ignore no-explicit-any
  } as any;

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
  // passCtx.projMatrix = mat4.identity();
  // passCtx.viewMatrix = mat4.identity();
  // passCtx.vpMatrix = mat4.identity();
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

  await writePng(resultData.buffer, RESULT_SIZE, PREVIEW_PATH);
});
