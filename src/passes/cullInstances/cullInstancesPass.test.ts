import {
  createGpuDevice_TESTS,
  createMockPassCtx,
  mockNaniteObjectBuffers,
} from '../../sys_deno/testUtils.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import {
  cmdCopyToReadbackBuffer,
  createReadbackBuffer,
  getItemsPerThread,
  readBufferToCPU,
} from '../../utils/webgpu.ts';
import { createGrid, createInstancesData } from '../../scene/instancesData.ts';
import { BoundingSphere } from '../../utils/calcBounds.ts';
import { CullInstancesPass } from './cullInstancesPass.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import {
  createDrawnInstanceIdsBuffer,
  parseDrawnInstancesBuffer,
} from '../../scene/naniteBuffers/drawnInstancesBuffer.ts';
import { SHADER_PARAMS as SHADER_PARAMS_CULL_MESHLETS } from '../cullMeshlets/cullMeshletsPass.wgsl.ts';
import { assert, assertAlmostEquals, assertEquals } from 'assert';
import { createDrawnImpostorsBuffer } from '../../scene/naniteBuffers/drawnImpostorsBuffer.ts';
import { CONFIG } from '../../constants.ts';

const OBJ_NAME = 'CullInstancesPass-obj';
const ALL_MESHLETS_COUNT = 140;
const BOUNDS: BoundingSphere = {
  center: [0.01, 0.02, 0.03],
  radius: 1.04,
};
const INSTANCES_X = 1 << 10; // 1024
const INSTANCES_Y = 33;

Deno.test('CullInstancesPass', async () => {
  CONFIG.cullingInstances.frustumCulling = false;
  CONFIG.cullingInstances.occlusionCulling = false;
  CONFIG.impostors.forceOnlyBillboards = false;
  CONFIG.impostors.billboardThreshold = 0;
  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();

  const uniforms = new RenderUniformsBuffer(device);

  const mockInstances = createInstancesData(
    device,
    OBJ_NAME,
    createGrid(INSTANCES_X, INSTANCES_Y)
  );

  // result buffer
  const bufferGpu = createDrawnInstanceIdsBuffer(
    device,
    OBJ_NAME,
    ALL_MESHLETS_COUNT,
    mockInstances.count,
    BOUNDS
  );
  const bufferReadback = createReadbackBuffer(device, bufferGpu);
  const billboardImpostorsBuffer = createDrawnImpostorsBuffer(
    device,
    OBJ_NAME,
    1
  );

  // mock nanite buffers
  const mockBuffers = mockNaniteObjectBuffers();
  mockBuffers.drawnInstancesBuffer = bufferGpu;
  mockBuffers.drawnImpostorsBuffer = billboardImpostorsBuffer;

  // nanite object
  const mockNaniteObject: NaniteObject = {
    name: OBJ_NAME,
    meshletCount: ALL_MESHLETS_COUNT,
    instancesCount: mockInstances.count,
    buffers: mockBuffers,
    bindInstanceTransforms: (bindingIdx: number): GPUBindGroupEntry => ({
      binding: bindingIdx,
      resource: { buffer: mockInstances.transformsBuffer },
    }),
    // deno-lint-ignore no-explicit-any
  } as any;

  // pass
  const pass = new CullInstancesPass(device);

  // submit
  const cmdBuf = device.createCommandEncoder();
  const passCtx = createMockPassCtx(device, cmdBuf);
  // passCtx.projMatrix = mat4.identity();
  // passCtx.viewMatrix = mat4.identity();
  // passCtx.vpMatrix = mat4.identity();
  passCtx.globalUniforms = uniforms;
  uniforms.update(passCtx);
  pass.cmdCullInstances(passCtx, mockNaniteObject);
  cmdCopyToReadbackBuffer(cmdBuf, bufferGpu, bufferReadback);
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  // read back
  const resultDataRaw = await readBufferToCPU(Uint32Array, bufferReadback);
  // printTypedArray('resultData', resultDataRaw);

  const result = parseDrawnInstancesBuffer(resultDataRaw);
  // console.log('RESULT', result);

  const expWorkgroupsX = getItemsPerThread(
    ALL_MESHLETS_COUNT,
    SHADER_PARAMS_CULL_MESHLETS.workgroupSizeX
  );
  assertEquals(result.workgroupsX, expWorkgroupsX);
  assertEquals(result.workgroupsZ, 1);
  assertEquals(result.allMeshletsCount, ALL_MESHLETS_COUNT);
  assertAlmostEquals(result.boundingSphere[0], BOUNDS.center[0]);
  assertAlmostEquals(result.boundingSphere[1], BOUNDS.center[1]);
  assertAlmostEquals(result.boundingSphere[2], BOUNDS.center[2]);
  assertAlmostEquals(result.boundingSphere[3], BOUNDS.radius);

  // based on instances data
  // Following case only happens when we have more instances than max dispatch size.
  // May fail if you set instances too low. But half the value of testing is in
  // that particular edge case, so...
  assertEquals(result.workgroupsY, SHADER_PARAMS_CULL_MESHLETS.maxWorkgroupsY); // cannot be more
  assertEquals(result.actuallyDrawnInstances, mockInstances.count); // the actual count

  for (let i = 0; i < mockInstances.count; i++) {
    assert(result.instanceIds.includes(i));
  }

  // cleanup
  console.log(
    'CullInstancesPass() test passed OK. Destroying GPUDevice, may fail'
  );
  device.destroy();
});
