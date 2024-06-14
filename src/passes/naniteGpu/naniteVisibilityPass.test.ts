import {
  createGpuDevice_TESTS,
  injectDenoShader,
  createMockPassCtx,
  createMeshlets_TESTS,
  createReadbackBuffer,
  cmdCopyToReadBackBuffer,
  readBufferToCPU,
  assertSameArray,
} from '../../sys_deno/testUtils.ts';
import { NaniteVisibilityPass } from './naniteVisibilityPass.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { mat4 } from 'wgpu-matrix';
import { createNaniteLODTree } from '../../meshPreprocessing/index.ts';
import { CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import { createErrorMetric, getVisibilityStatus } from '../naniteUtils.ts';
import { assertEquals } from 'assert';

const THRESHOLD = 1.0;
const ERR_GT = 0.002;
const ERR_LT = 0.001;

const EXPECTED_DRAWN_MESHLETS_COUNT = 2;

// projErr = screenHeight * cotHalfFov * r / Math.sqrt(d2 - r * r)
// projErr =          600 *        2.4 * r / 1.44
// projErr = 1000 * r, where 'r' is the simplification error we provide for each meshlet
// RENDER: parentError > threshold && clusterError <= threshold

Deno.test('NaniteVisibilityPass', async () => {
  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();
  injectDenoShader(
    NaniteVisibilityPass,
    import.meta.url,
    'naniteVisibilityPass.wgsl'
  );

  // prettier-ignore
  const allMeshlets = createMeshlets_TESTS([
    // ignore this, should never be rendered, just by default visibilityBuffer is [0,0,...,0] and that could be confusing
    { maxSiblingsError: Infinity, parentError: Infinity, lodLevel: 1 },

    // test root-like with no parent
    // 1: no parent AND (my error > threshold) <- FAIL (failed threshold)
    { maxSiblingsError: ERR_GT, parentError: Infinity, lodLevel: 0, parentIdx: 0 },
    // 2: no parent AND (my error < threshold) <- OK
    { maxSiblingsError: ERR_LT, parentError: Infinity, lodLevel: 0, parentIdx: 0 },

    // test with parent error
    // 3: (parent error < threshold) - FAIL (would render parent instead)
    { maxSiblingsError: ERR_LT, parentError: ERR_LT, lodLevel: 0, parentIdx: 0 },
    // 4: (parent error > threshold) AND (my error > threshold) <- FAIL (failed threshold)
    { maxSiblingsError: ERR_GT, parentError: ERR_GT, lodLevel: 0, parentIdx: 0 },
    // 5: (parent error > threshold) AND (my error < threshold) <- OK
    { maxSiblingsError: ERR_LT, parentError: ERR_GT, lodLevel: 0, parentIdx: 0 },
    // The case when parentError < maxSiblingsError should never happen.
  ]);
  // console.log(allMeshlets);

  const uniforms = new RenderUniformsBuffer(device);
  const naniteObject = createNaniteLODTree(
    device,
    // deno-lint-ignore no-explicit-any
    { size: 'mocked-vertex-buffer-size' } as any, // vertexBuffer
    new Float32Array([0, 1, 2]),
    allMeshlets,
    { xCnt: 1, yCnt: 1, offset: 1 }
  );
  const readbackVisiblityBuffer = createReadbackBuffer(
    device,
    naniteObject.visiblityBuffer
  );

  // pass
  const pass = new NaniteVisibilityPass(device, uniforms, naniteObject);
  const readbackDrawIndirectParamsBuffer = createReadbackBuffer(
    device,
    pass.drawIndirectParamsBuffer
  );

  // submit
  const cmdBuf = device.createCommandEncoder();
  const passCtx = createMockPassCtx(device, cmdBuf);
  passCtx.projMatrix = mat4.identity();
  passCtx.viewMatrix = mat4.identity();
  passCtx.vpMatrix = mat4.identity();
  CONFIG.nanite.render.pixelThreshold = THRESHOLD;
  uniforms.update(passCtx);
  pass.cmdCalculateVisibility(passCtx, naniteObject);
  cmdCopyToReadBackBuffer(
    cmdBuf,
    pass.drawIndirectParamsBuffer,
    readbackDrawIndirectParamsBuffer
  );
  cmdCopyToReadBackBuffer(
    cmdBuf,
    naniteObject.visiblityBuffer,
    readbackVisiblityBuffer
  );
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  // read back
  const drawParamsResult = await readBufferToCPU(
    Uint32Array,
    readbackDrawIndirectParamsBuffer
  );
  let visbilityResult = await readBufferToCPU(
    Uint32Array,
    readbackVisiblityBuffer
  );

  // check draw params
  // printTypedArray('drawParamsResult ', drawParamsResult);
  assertSameArray(drawParamsResult, [
    CONFIG.nanite.preprocess.meshletMaxTriangles * VERTS_IN_TRIANGLE, // vertexCount
    EXPECTED_DRAWN_MESHLETS_COUNT, // instanceCount
    0, // firstVertex
    0, // firstInstance
  ]);

  // check visibility buffer
  // printTypedArray('visbilityResult RAW: ', visbilityResult);
  visbilityResult = visbilityResult.slice(0, drawParamsResult[1]); // the buffer has a lot of space, we do not use it whole
  // printTypedArray('visbilityResult ', visbilityResult);
  const getProjectedError = createErrorMetric(passCtx, mat4.identity());

  allMeshlets.forEach((mWIP) => {
    if (mWIP.id === 0) return; // the dummy one, cause idx==0 is also the default value of the U32Array buffer

    const meshlet = naniteObject.find(mWIP.id)!;
    const expectedStr = getVisibilityStatus(getProjectedError, meshlet);
    const expected = expectedStr === 'rendered';
    const actual = visbilityResult.includes(mWIP.id);
    /*console.log({
      id: mWIP.id,
      expected,
      actual,
    });*/
    assertEquals(expected, actual, `Meshlet ${mWIP.id} has invalid visibility`);
  });

  // cleanup
  device.destroy();
});
