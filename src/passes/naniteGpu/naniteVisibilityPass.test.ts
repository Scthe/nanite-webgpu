import {
  createGpuDevice_TESTS,
  injectDenoShader,
  createMockPassCtx,
  createMeshlets_TESTS,
  assertSameArray,
} from '../../sys_deno/testUtils.ts';
import { NaniteVisibilityPass } from './naniteVisibilityPass.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { mat4 } from 'wgpu-matrix';
import { CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import {
  createErrorMetric,
  getVisibilityStatus,
} from '../naniteCpu/calcNaniteMeshletsVisibility.ts';
import { assertEquals } from 'assert';
import { createNaniteObject } from '../../scene/createNaniteObject.ts';
import {
  cmdCopyToReadBackBuffer,
  createReadbackBuffer,
  readBufferToCPU,
} from '../../utils/webgpu.ts';
import { parseVisibilityBuffer } from '../../scene/naniteObject.ts';

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
  const allWIPMeshlets = createMeshlets_TESTS([
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
  const naniteObject = createNaniteObject(
    device,
    'test-object',
    // deno-lint-ignore no-explicit-any
    { size: 'mocked-vertex-buffer-size' } as any, // mock vertexBuffer
    new Float32Array([0, 1, 2]), // mock rawVertices
    allWIPMeshlets,
    { xCnt: 1, yCnt: 1, offset: 1 } // mock instancesGrid
  );

  // retrieve visiblityBuffer
  const visiblityBuffer = naniteObject.dangerouslyGetVisibilityBuffer();
  const readbackVisiblityBuffer = createReadbackBuffer(device, visiblityBuffer);

  // pass
  const pass = new NaniteVisibilityPass(device);

  // submit
  const cmdBuf = device.createCommandEncoder();
  const passCtx = createMockPassCtx(device, cmdBuf);
  passCtx.projMatrix = mat4.identity();
  passCtx.viewMatrix = mat4.identity();
  passCtx.vpMatrix = mat4.identity();
  passCtx.globalUniforms = uniforms;
  CONFIG.nanite.render.pixelThreshold = THRESHOLD;
  uniforms.update(passCtx);
  pass.cmdCalculateVisibility(passCtx, naniteObject);
  cmdCopyToReadBackBuffer(cmdBuf, visiblityBuffer, readbackVisiblityBuffer);
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  // read back
  const resultData = await readBufferToCPU(
    Uint32Array,
    readbackVisiblityBuffer
  );
  // printTypedArray('resultData', resultData);

  // check draw params
  const parsedResult = parseVisibilityBuffer(naniteObject, resultData);
  const drawParamsResult = parsedResult.indirectDraw;
  // printTypedArray('drawParamsResult ', drawParamsResult);
  assertSameArray(drawParamsResult, [
    CONFIG.nanite.preprocess.meshletMaxTriangles * VERTS_IN_TRIANGLE, // vertexCount
    EXPECTED_DRAWN_MESHLETS_COUNT, // instanceCount
    0, // firstVertex
    0, // firstInstance
  ]);

  // check visibility buffer
  const visibilityResult = parsedResult.meshletIds;
  // printTypedArray('visbilityResult', visibilityResultArr);
  const getProjectedError = createErrorMetric(passCtx, mat4.identity());

  allWIPMeshlets.forEach((mWIP) => {
    if (mWIP.id === 0) return; // the dummy one, cause idx==0 is also the default value of the U32Array buffer

    const meshlet = naniteObject.find(mWIP.id)!;
    const resultMeshlet = visibilityResult.find((m) => m.meshletId === mWIP.id);

    // compare if it's visible or not
    const expectedStr = getVisibilityStatus(getProjectedError, meshlet);
    const expected = expectedStr === 'rendered';
    // console.log({ id: mWIP.id, expected, resultMeshlet });
    assertEquals(
      expected,
      resultMeshlet !== undefined,
      `Meshlet ${mWIP.id} has invalid visibility`
    );

    // check transformId
    if (resultMeshlet) {
      assertEquals(resultMeshlet.transformId, 0);
    }
  });

  // cleanup
  device.destroy();
});
