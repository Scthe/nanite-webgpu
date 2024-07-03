import {
  createGpuDevice_TESTS,
  createMockPassCtx,
  createMeshlets_TESTS,
  assertSameArray,
} from '../../sys_deno/testUtils.ts';
import { NaniteVisibilityPass } from './naniteVisibilityPass.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import { mat4 } from 'wgpu-matrix';
import { BYTES_VEC3, CONFIG, VERTS_IN_TRIANGLE } from '../../constants.ts';
import {
  NaniteVisibilityStatus,
  calcCotHalfFov,
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
import { NaniteVisibilityBufferCPU } from '../naniteCpu/types.ts';
import { GPUMesh } from '../../scene/debugMeshes.ts';
import { ParsedMesh } from '../../scene/objLoader.ts';
import { createGrid, createInstancesData } from '../../scene/instancesData.ts';
import { ImpostorBillboardTexture } from '../../scene/renderImpostors/renderImpostors.ts';

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
  CONFIG.nanite.render.useFrustumCulling = false; // disabled as would require precise mock data
  CONFIG.cullingInstances.enabled = false;

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

  // mock mesh data, does not matter as visibility buffer only operates on instances+meshlets
  // It never has to step down to the actuall geometry
  const mockOriginalMesh: GPUMesh = {
    vertexBuffer: { size: 'mocked-vertex-buffer-size' },
    // deno-lint-ignore no-explicit-any
  } as any;
  const mockParsedMesh: ParsedMesh = {
    vertexCount: 1,
    positions: new Float32Array([0, 1, 2]), // mock
    positionsStride: BYTES_VEC3,
    normals: new Float32Array([0, 1, 0]), // mock
    uv: new Float32Array([0.5, 0.5]), // mock
    indices: new Uint32Array([0, 1, 2]),
    indicesCount: 3,
    verticesAndAttributes: new Float32Array([0, 1, 2]), // mock
    verticesAndAttributesStride: 32,
    bounds: {
      box: [
        [0, 0, 0],
        [0, 0, 0],
      ],
      sphere: { center: [0, 0, 0], radius: 100 },
    },
  };

  // finally, we can create nanite object
  const mockInstances = createInstancesData(
    device,
    'test-object',
    createGrid(1, 1)
  );
  const mockImpostors: ImpostorBillboardTexture = undefined!;
  const naniteObject = createNaniteObject(
    device,
    'test-object',
    mockOriginalMesh,
    mockParsedMesh,
    allWIPMeshlets,
    mockInstances,
    mockImpostors
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
  const naniteVisibilityBufferCPU = new NaniteVisibilityBufferCPU();
  naniteVisibilityBufferCPU.initialize(allWIPMeshlets.length);
  // printTypedArray('visbilityResult', visibilityResultArr);
  const getProjectedError = createErrorMetric(
    passCtx,
    calcCotHalfFov(),
    naniteVisibilityBufferCPU,
    mat4.identity()
  );

  allWIPMeshlets.forEach((mWIP) => {
    if (mWIP.id === 0) return; // the dummy one, cause idx==0 is also the default value of the U32Array buffer

    const meshlet = naniteObject.find(mWIP.id)!;
    const resultMeshlet = visibilityResult.find((m) => m.meshletId === mWIP.id);

    // compare if it's visible or not
    const expectedStr = getVisibilityStatus(getProjectedError, meshlet);
    const expected = expectedStr === NaniteVisibilityStatus.RENDERED;
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
