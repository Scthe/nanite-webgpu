import {
  absPathFromRepoRoot,
  createGpuDevice_TESTS,
  injectMeshoptimizerWASM,
  injectMetisWASM,
} from '../sys_deno/testUtils.ts';
import { OVERRIDE_MESHOPTIMIZER_WASM_PATH } from '../meshPreprocessing/meshoptimizerUtils.ts';
import { SceneName } from './sceneFiles.ts';
import { FileTextReader, loadScene } from './scene.ts';
import { assertEquals, assertExists } from 'assert';

const FAILING_SCENE: SceneName = 'displacedPlaneFlat';

OVERRIDE_MESHOPTIMIZER_WASM_PATH.value =
  'file:///' + absPathFromRepoRoot('static/meshoptimizer.wasm');

Deno.test({
  name: 'loadScene() with object that is impossible to simplify',
  // This tests passes asserts, but hangs in `device.destroy();`, because wgpu is <redacted>
  ignore: true,
  async fn() {
    injectMeshoptimizerWASM();
    injectMetisWASM();

    const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();
    const objTextReaderFn: FileTextReader = (filename) => {
      const filepath = absPathFromRepoRoot(`static/${filename}`);
      return Deno.readTextFile(filepath);
    };

    let error: Error | undefined = undefined;
    try {
      await loadScene(device, objTextReaderFn, FAILING_SCENE);
    } catch (e) {
      error = e;
    }
    assertExists(error);
    const EXP_ERR_MSG = `Failed to simplify the mesh. Was not able to simplify beyond LOD level 0. This usually happens if you have duplicated vertices (1920, should roughly match Blender's). One cause could be a flat shading or tons of UV islands.`;
    assertEquals(error.message, EXP_ERR_MSG);

    await reportWebGPUErrAsync();

    // cleanup
    console.log(
      'loadScene() test passed OK. Destroying GPUDevice (which will stall Deno)'
    );
    device.destroy();
  },
});
