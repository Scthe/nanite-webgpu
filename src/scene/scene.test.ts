import {
  injectMeshoptimizerWASM,
  injectMetisWASM,
  relativePath,
} from '../sys_deno/testUtils.ts';
import { SceneName } from './sceneFiles.ts';
import { loadObject } from './scene.ts';
import { assertEquals, assertExists } from 'assert';

const FAILING_SCENE: SceneName = 'cube'; // does not matter, we override .obj anyway
const TEST_FILE = relativePath(import.meta, '__test__/invalid-mesh.obj');

import '../lib/meshoptimizer.d.ts';
import { CONFIG } from '../constants.ts';
injectMeshoptimizerWASM();

Deno.test({
  name: 'loadScene() with object that is impossible to simplify',
  async fn() {
    injectMeshoptimizerWASM();
    injectMetisWASM();

    // This tests passes asserts, but hangs in `device.destroy();`, because wgpu is <redacted>.
    // So we use stub for GPUDevice.
    // const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();
    const mockDevice: GPUDevice = {
      createBuffer: () => {},
      queue: { writeBuffer: () => {} },
      // deno-lint-ignore no-explicit-any
    } as any;

    CONFIG.loaders.textFileReader = (_filename) => {
      return Deno.readTextFile(TEST_FILE);
    };

    let error: Error | undefined = undefined;
    try {
      // await loadScene(device, objTextReaderFn, FAILING_SCENE);
      await loadObject(mockDevice, FAILING_SCENE, undefined!, undefined!);
    } catch (e) {
      error = e;
      // if (TEST_FILE) throw e; // uncomment if error happens somewhere else to get real stacktrace
    }
    assertExists(error);
    const EXP_ERR_MSG = `Failed to simplify the mesh. Was not able to simplify beyond LOD level 0. This usually happens if you have duplicated vertices (128, should roughly match Blender's). One cause could be a flat shading or tons of UV islands.`;
    assertEquals(error.message, EXP_ERR_MSG);

    // await reportWebGPUErrAsync();

    // cleanup
    // console.log(
    // 'loadScene() test passed OK. Destroying GPUDevice (which will stall Deno)'
    // );
    // device.destroy();
    // console.log('Past device.destroy()'); // never reached..
  },
});
