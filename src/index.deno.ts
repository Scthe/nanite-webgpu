import { getRowPadding, createCapture } from 'std/webgpu';

import { Dimensions } from './utils/index.ts';
import { Renderer } from './renderer.ts';
import { SceneName } from './scene/sceneFiles.ts';
import { createGpuDevice } from './utils/webgpu.ts';
import { loadScene } from './scene/load/loadScene.ts';
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

// https://deno.land/std@0.209.0/webgpu/mod.ts

const SCENE_FILE: SceneName = 'jinx';
// const SCENE_FILE: SceneName = 'singleBunny';

const VIEWPORT_SIZE: Dimensions = {
  width: 1270,
  height: 720,
};
const PREFERRED_CANVAS_FORMAT = 'rgba8unorm-srgb';

injectMeshoptimizerWASM();
injectMetisWASM();

CONFIG.softwareRasterizer.enabled = false;
CONFIG.loaders.textFileReader = textFileReader_Deno;
CONFIG.loaders.createTextureFromFile = createTextureFromFile_Deno;
CONFIG.colors.gamma = 1.0; // I assume the png library does it for us?

// GPUDevice
const device = (await createGpuDevice())!;
if (!device) Deno.exit(1);
const errorSystem = createErrorSystem(device);
errorSystem.startErrorScope('init');

// file load
console.log('Loading scene..');
const scene = await loadSceneFile(device, SCENE_FILE);

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

async function frame() {
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
  await writePngFromGPUBuffer(outputBuffer, VIEWPORT_SIZE, './output.png');
}

// start rendering
frame();

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

function loadSceneFile(device: GPUDevice, sceneName: SceneName) {
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

  return loadScene(device, sceneName, progCb);
}
