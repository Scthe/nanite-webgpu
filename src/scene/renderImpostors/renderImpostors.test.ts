import {
  absPathFromRepoRoot,
  assertBinarySnapshot,
  createGpuDevice_TESTS,
  injectMeshoptimizerWASM,
  injectMetisWASM,
  relativePath,
} from '../../sys_deno/testUtils.ts';
import { Dimensions } from '../../utils/index.ts';
import {
  IMPOSTOR_BYTES_PER_PIXEL,
  ImpostorMesh,
  ImpostorRenderer,
} from './renderImpostors.ts';
import { DEFAULT_COLOR } from '../../passes/_shaderSnippets/shading.wgsl.ts';
import { createFallbackTexture } from '../../utils/textures.ts';
import { loadObjFile } from '../objLoader.ts';
import { createOriginalMesh } from '../scene.ts';
import { writePng } from '../../sys_deno/fakeCanvas.ts';
import {
  createReadbackBufferFromTexture,
  cmdCopyTextureToBuffer,
  readBufferToCPU,
} from '../../utils/webgpu.ts';

// needed cause stray imports TODO [LOW] fix imports?
import '../../lib/meshoptimizer.d.ts';
import '../../lib/metis.d.ts';

injectMeshoptimizerWASM();
injectMetisWASM();

const TEST_FILE = relativePath(import.meta, '__test__/cube.obj');

const PREVIEW_PATH = relativePath(import.meta, '__test__/test_preview.png');
const PREVIEW_PATH_N = relativePath(import.meta, '__test__/test_preview.n.png');

const SNAPSHOT_FILE = relativePath(
  import.meta,
  '__test__/ImpostorsRenderer.snapshot.bin'
);
const SNAPSHOT_FILE_N = relativePath(
  import.meta,
  '__test__/ImpostorsRenderer.n.snapshot.bin'
);

const IMPOSTOR_VIEWS = 3; // NOTE: the back view is whole black
const IMPOSTOR_IMAGE_SIZE = 64;

const OBJ_NAME = 'impostor-cube';
const TEXTURE_DIMENSIONS: Dimensions = {
  width: IMPOSTOR_IMAGE_SIZE * IMPOSTOR_VIEWS,
  height: IMPOSTOR_IMAGE_SIZE,
};

Deno.test('ImpostorsRenderer', async () => {
  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();

  const filePath = absPathFromRepoRoot(TEST_FILE);
  const text = Deno.readTextFileSync(filePath);
  const loadedObj = await loadObjFile(text, 1.0);
  const originalMesh = createOriginalMesh(device, OBJ_NAME, loadedObj);

  const mesh: ImpostorMesh = {
    name: OBJ_NAME,
    vertexBuffer: originalMesh.vertexBuffer,
    normalsBuffer: originalMesh.normalsBuffer,
    uvBuffer: originalMesh.uvBuffer,
    indexBuffer: originalMesh.indexBuffer,
    triangleCount: originalMesh.triangleCount,
    bounds: loadedObj.bounds.sphere,
    texture: undefined,
  };

  const fallbackDiffuseTexture = createFallbackTexture(device, DEFAULT_COLOR);
  const fallbackDiffuseTextureView = fallbackDiffuseTexture.createView();
  const pass = new ImpostorRenderer(
    device,
    fallbackDiffuseTextureView,
    IMPOSTOR_VIEWS,
    IMPOSTOR_IMAGE_SIZE
  );

  const result = pass.createImpostorTexture(device, mesh);
  const readbackBuffer = createReadbackBufferFromTexture(
    device,
    result.texture,
    IMPOSTOR_BYTES_PER_PIXEL
  );

  // submit
  const cmdBuf = device.createCommandEncoder();
  cmdCopyTextureToBuffer(
    cmdBuf,
    result.texture,
    IMPOSTOR_BYTES_PER_PIXEL,
    readbackBuffer
  );
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  const resultData = await readBufferToCPU(Uint32Array, readbackBuffer);

  // cleanup
  device.destroy();

  const pixelCount = resultData.length / 2;
  const colorData = new Uint32Array(pixelCount);
  const normalsData = new Uint32Array(pixelCount);

  for (let i = 0; i < pixelCount; i++) {
    colorData[i] = resultData[2 * i];
    normalsData[i] = resultData[2 * i + 1];
  }

  await writePng(colorData.buffer, TEXTURE_DIMENSIONS, PREVIEW_PATH);
  await writePng(normalsData.buffer, TEXTURE_DIMENSIONS, PREVIEW_PATH_N);

  await assertBinarySnapshot(SNAPSHOT_FILE, colorData.buffer);
  await assertBinarySnapshot(SNAPSHOT_FILE_N, normalsData.buffer);
});
