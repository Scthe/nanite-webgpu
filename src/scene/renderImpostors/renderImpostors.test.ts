import { createCapture } from 'std/webgpu';
import { existsSync } from 'fs';
import {
  absPathFromRepoRoot,
  createGpuDevice_TESTS,
  injectMeshoptimizerWASM,
  injectMetisWASM,
  relativePath,
} from '../../sys_deno/testUtils.ts';
import { Dimensions } from '../../utils/index.ts';
import { ImpostorMesh, ImpostorRenderer } from './renderImpostors.ts';
import { DEFAULT_COLOR } from '../../passes/_shaderSnippets/shading.wgsl.ts';
import {
  createFallbackTexture,
  createSamplerNearer,
} from '../../utils/textures.ts';
import { loadObjFile } from '../objLoader.ts';
import { createOriginalMesh } from '../scene.ts';
import { cmdCopyTextureToBuffer, writePng } from '../../sys_deno/fakeCanvas.ts';

// needed cause stray imports TODO [LOW] fix imports?
import '../../lib/meshoptimizer.d.ts';
import '../../lib/metis.d.ts';
import { assertEquals } from 'assert';

injectMeshoptimizerWASM();
injectMetisWASM();

const OUTPUT_PATH = relativePath(import.meta, '__test__/test_preview.png');
const TEST_FILE = relativePath(import.meta, '__test__/cube.obj');
const SNAPSHOT_FILE = relativePath(
  import.meta,
  '__test__/ImpostorsRenderer.snapshot.bin'
);

const OUT_TEXTURE_FORMAT = 'rgba8unorm-srgb';
const IMPOSTOR_VIEWS = 2;
const IMPOSTOR_IMAGE_SIZE = 50;

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

  const denoResult = createCapture(
    device,
    TEXTURE_DIMENSIONS.width,
    TEXTURE_DIMENSIONS.height
  );

  const fallbackDiffuseTexture = createFallbackTexture(device, DEFAULT_COLOR);
  const fallbackDiffuseTextureView = fallbackDiffuseTexture.createView();
  const defaultSampler = createSamplerNearer(device);
  const pass = new ImpostorRenderer(
    device,
    defaultSampler,
    fallbackDiffuseTextureView,
    OUT_TEXTURE_FORMAT
  );

  // submit
  const cmdBuf = device.createCommandEncoder();
  pass.renderImpostor(device, cmdBuf, denoResult.texture, mesh);
  cmdCopyTextureToBuffer(
    cmdBuf,
    denoResult.texture,
    denoResult.outputBuffer,
    TEXTURE_DIMENSIONS
  );
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  const bytes = await writePng(
    denoResult.outputBuffer,
    TEXTURE_DIMENSIONS,
    OUTPUT_PATH
  );

  // cleanup
  device.destroy();

  if (existsSync(SNAPSHOT_FILE)) {
    console.log(`Comparing snapshots`);
    const expected = await Deno.readFile(SNAPSHOT_FILE);
    // expected[0] = 11; // test that it fails
    assertEquals(bytes, expected, 'Uint8Array result does not match snapshot', {
      formatter: () => '<buffers-too-long-to-print>',
    });
  } else {
    console.log(`Creating new snapshot: '${SNAPSHOT_FILE}'`);
    await Deno.writeFile(SNAPSHOT_FILE, bytes);
  }
});
