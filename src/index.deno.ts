import { getRowPadding, createCapture } from 'std/webgpu';
import { parseArgs } from 'jsr:@std/cli/parse-args';

import { Dimensions } from './utils/index.ts';
import { Renderer } from './renderer.ts';
import { SCENES, SceneName, isValidSceneName } from './scene/sceneFiles.ts';
import { createGpuDevice } from './utils/webgpu.ts';
import { OnObjectLoadedCb, loadScene } from './scene/load/loadScene.ts';
import { createErrorSystem } from './utils/errors.ts';
import {
  injectMeshoptimizerWASM,
  injectMetisWASM,
} from './sys_deno/testUtils.ts';
import { writePngFromGPUBuffer } from './sys_deno/fakeCanvas.ts';
import { CONFIG } from './constants.ts';
import {
  textFileReader_Deno,
  createTextureFromFile_Deno,
} from './sys_deno/loadersDeno.ts';
import { ObjectLoadingProgressCb } from './scene/load/types.ts';
import { Scene } from './scene/scene.ts';
import { exportToFile } from './scene/import-export/import-export.ts';

const SCENE_FILE: SceneName = 'jinx';
// const SCENE_FILE: SceneName = 'singleBunny';

injectMeshoptimizerWASM();
injectMetisWASM();

CONFIG.softwareRasterizer.enabled = false;
CONFIG.loaders.textFileReader = textFileReader_Deno;
CONFIG.loaders.createTextureFromFile = createTextureFromFile_Deno;
CONFIG.colors.gamma = 1.0; // I assume the png library does it for us?

const cliArgs = parseArgs(Deno.args, {
  boolean: ['export'],
});
// console.log(cliArgs);

const actSceneName = parseSceneName(cliArgs);

// GPUDevice
const device = (await createGpuDevice())!;
if (!device) Deno.exit(1);
const errorSystem = createErrorSystem(device);
errorSystem.startErrorScope('init');

if (cliArgs.export) {
  CONFIG.isExporting = true;
  const exportedFilePath = `static/models/${actSceneName}.json`;
  let alreadyExportedSmth = false;

  await loadSceneFile(device, actSceneName, (obj) => {
    if (alreadyExportedSmth) {
      throw new Error(`Expected 1 nanite object in the scene. Cannot export more`); // prettier-ignore
    }
    alreadyExportedSmth = true;

    return exportToFile(device, obj, exportedFilePath);
  });

  await errorSystem.reportErrorScopeAsync((lastError) => {
    console.error(lastError);
    throw new Error(lastError);
  });

  console.log(`Export success. Result file: '${exportedFilePath}'`);
} else {
  const scene = await loadSceneFile(device, actSceneName);
  renderSceneToFile(device, scene, './output.png');
}

async function renderSceneToFile(
  device: GPUDevice,
  scene: Scene,
  outputPath: string
) {
  const VIEWPORT_SIZE: Dimensions = {
    width: 1270,
    height: 720,
  };
  const PREFERRED_CANVAS_FORMAT = 'rgba8unorm-srgb';

  // create canvas
  console.log('Creating output canvas..');
  const { texture: windowTexture, outputBuffer } = createCapture(
    device,
    VIEWPORT_SIZE.width,
    VIEWPORT_SIZE.height
  );
  const windowTextureView = windowTexture.createView();

  // renderer setup
  // const profiler = new GpuProfiler(device);
  console.log('Creating renderer..');
  const renderer = new Renderer(
    device,
    VIEWPORT_SIZE,
    PREFERRED_CANVAS_FORMAT,
    undefined //profiler
  );

  // init ended, report errors
  console.log('Checking async WebGPU errors after init()..');
  const lastError = await errorSystem.reportErrorScopeAsync();
  if (lastError) {
    console.error(lastError);
    Deno.exit(1);
  }
  console.log('Init OK!');

  const mainCmdBufDesc: GPUCommandEncoderDescriptor = {
    label: 'main-frame-cmd-buffer',
  };

  // START: Render frame
  console.log('Frame start!');
  errorSystem.startErrorScope('frame');

  // profiler.beginFrame();
  // const deltaTime = STATS.deltaTimeMS * MILISECONDS_TO_SECONDS;

  // const inputState = getInputState();
  // renderer.updateCamera(deltaTime, inputState);

  // record commands
  const cmdBuf = device.createCommandEncoder(mainCmdBufDesc);
  renderer.cmdRender(cmdBuf, scene, windowTextureView);

  // result to buffer
  cmdCopyTextureToBuffer(cmdBuf, windowTexture, outputBuffer, VIEWPORT_SIZE);

  // submit commands
  // profiler.endFrame(cmdBuf);
  device.queue.submit([cmdBuf.finish()]);
  console.log('Frame submitted, checking errors..');

  // frame end
  await errorSystem.reportErrorScopeAsync((lastError) => {
    console.error(lastError);
    throw new Error(lastError);
  });

  // write output
  await writePngFromGPUBuffer(outputBuffer, VIEWPORT_SIZE, outputPath);
}

/////////////////////
/// UTILS

function cmdCopyTextureToBuffer(
  cmdBuf: GPUCommandEncoder,
  texture: GPUTexture,
  outputBuffer: GPUBuffer,
  dimensions: Dimensions
): void {
  const { padded } = getRowPadding(dimensions.width);

  cmdBuf.copyTextureToBuffer(
    { texture },
    {
      buffer: outputBuffer,
      bytesPerRow: padded,
    },
    dimensions
  );
}

function parseSceneName(cliArgs_: typeof cliArgs): SceneName {
  let result: SceneName = SCENE_FILE;
  const cliSceneName = cliArgs_._[0];

  if (isValidSceneName(cliSceneName)) {
    result = cliSceneName;
  } else if (cliSceneName != undefined) {
    console.warn(`Invalid scene name '${cliSceneName}', try one of: `, Object.keys(SCENES)); // prettier-ignore
  }
  return result;
}

function loadSceneFile(
  device: GPUDevice,
  sceneName: SceneName,
  objectLoadedCb?: OnObjectLoadedCb
) {
  console.log(`Loading scene '${sceneName}'..`);

  const setReportText = (msg: string) => {
    console.log(msg);
  };
  let lastReportedPercent = -1;

  // deno-lint-ignore require-await
  const progCb: ObjectLoadingProgressCb = async (objName, p): Promise<void> => {
    if (typeof p === 'string') {
      setReportText(p);
    } else {
      const percent = Math.floor(p * 100);
      if (percent !== lastReportedPercent && percent % 10 === 0) {
        lastReportedPercent = percent;
        setReportText(`Loading '${objName}': ${percent}%`);
      }
    }
  };

  return loadScene(device, sceneName, progCb, objectLoadedCb);
}
