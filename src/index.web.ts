import { createGpuDevice } from './utils/webgpu.ts';
import { createInputHandler } from './sys_web/input.ts';
import { Renderer, injectShaderTexts } from './renderer.ts';
import { STATS } from './sys_web/stats.ts';
import { initializeGUI, onGpuProfilerResult } from './sys_web/gui.ts';
import {
  GpuProfiler,
  getDeltaFromTimestampMS,
  getProfilerTimestamp,
} from './gpuProfiler.ts';
import { initCanvasResizeSystem } from './sys_web/cavasResize.ts';
import {
  CONFIG,
  MILISECONDS_TO_SECONDS,
  SCENES,
  SceneFile,
} from './constants.ts';
import { loadScene } from './scene/index.ts';

//@ts-ignore it works OK
import drawMeshShader from './passes/naniteCpu/drawNanitesPass.wgsl';
//@ts-ignore it works OK
import drawNaniteGPUShader from './passes/naniteGpu/drawNaniteGPUPass.wgsl';
//@ts-ignore it works OK
import naniteVisibilityGPUShader from './passes/naniteGpu/naniteVisibilityPass.wgsl';
//@ts-ignore it works OK
import dbgMeshoptimizerShader from './passes/debug/dbgMeshoptimizerPass.wgsl';
//@ts-ignore it works OK
import dbgMeshoptimizerMeshletsShader from './passes/debug/dbgMeshoptimizerMeshletsPass.wgsl';
import { createErrorSystem } from './utils/errors.ts';
import { downloadVisibilityBuffer } from './scene/naniteObject.ts';
import { DrawNanitesPass } from './passes/naniteCpu/drawNanitesPass.ts';
import { Scene } from './scene/types.ts';
import { showHtmlEl, hideHtmlEl } from './utils/index.ts';

const SCENE_FILE: SceneFile = 'bunny';
// const SCENE_FILE: SceneFile = 'lucy';
// const SCENE_FILE: SceneFile = 'dragon'; // crashes WebAssembly cuz WebAssembly is..
// const SCENE_FILE: SceneFile = 'displacedPlane';
// const SCENE_FILE: SceneFile = 'cube';
// const SCENE_FILE: SceneFile = 'plane';

(async function () {
  // GPUDevice
  const device = await createGpuDevice();
  if (!device) {
    showErrorMessage();
    return;
  }
  const errorSystem = createErrorSystem(device);
  errorSystem.startErrorScope('init');

  // create canvas
  const PREFERRED_CANVAS_FORMAT = navigator.gpu.getPreferredCanvasFormat();
  const [canvas, canvasContext] = getCanvasContext(
    '#gpuCanvas',
    device,
    PREFERRED_CANVAS_FORMAT
  );
  const canvasResizeSystem = initCanvasResizeSystem(canvas, canvasContext);

  // input
  const getInputState = createInputHandler(window, canvas);

  // file load
  let scene: Scene;
  let loaderEl: HTMLElement | null = null;
  try {
    loaderEl = document.getElementById('loader-wrapper');
    showHtmlEl(loaderEl);
    scene = await loadSceneFile(device, SCENE_FILE);
  } catch (e) {
    throw e;
  } finally {
    hideHtmlEl(loaderEl);
  }

  // renderer setup
  const profiler = new GpuProfiler(device);
  injectShaderTexts({
    drawMeshShader,
    drawNaniteGPUShader,
    naniteVisibilityGPUShader,
    dbgMeshoptimizerShader,
    dbgMeshoptimizerMeshletsShader,
  });
  const renderer = new Renderer(
    device,
    canvasResizeSystem.getViewportSize(),
    PREFERRED_CANVAS_FORMAT
  );
  canvasResizeSystem.addListener(renderer.onCanvasResize);

  initializeGUI(profiler, scene, renderer.cameraCtrl);
  STATS.show();
  let done = false;

  const lastError = await errorSystem.reportErrorScopeAsync();
  if (lastError) {
    showErrorMessage(lastError);
    return;
  }

  const mainCmdBufDesc: GPUCommandEncoderDescriptor = {
    label: 'main-frame-cmd-buffer',
  };

  // frame callback
  const frame = () => {
    errorSystem.startErrorScope('frame');

    STATS.onEndFrame();
    STATS.onBeginFrame();
    profiler.beginFrame();
    const deltaTime = STATS.deltaTimeMS * MILISECONDS_TO_SECONDS;

    canvasResizeSystem.revalidateCanvasSize();

    const inputState = getInputState();
    renderer.updateCamera(deltaTime, inputState);

    // record commands
    const cmdBuf = device.createCommandEncoder(mainCmdBufDesc);
    const viewport = canvasResizeSystem.getViewportSize();
    const screenTexture = canvasResizeSystem.getScreenTextureView();
    renderer.cmdRender(cmdBuf, scene, viewport, screenTexture);

    // submit commands
    profiler.endFrame(cmdBuf);
    device.queue.submit([cmdBuf.finish()]);

    profiler.scheduleRaportIfNeededAsync(onGpuProfilerResult);

    // download GPU visibility buffer if needed
    if (CONFIG.nanite.render.nextFrameDebugVisiblityBuffer) {
      CONFIG.nanite.render.nextFrameDebugVisiblityBuffer = false;
      downloadVisibilityBuffer(device, scene.naniteObject).then((res): void => {
        DrawNanitesPass.updateRenderStats(
          res.naniteObject,
          res.meshletCount,
          undefined
        );
      });
    }

    // frame end
    if (!done) {
      errorSystem.reportErrorScopeAsync(onRenderFrameError); // not awaited!

      requestAnimationFrame(frame);
    }
  };

  // start rendering
  requestAnimationFrame(frame);

  function onRenderFrameError(lastError: string): never {
    showErrorMessage(lastError);
    done = true;
    throw new Error(lastError);
  }
})();

function getCanvasContext(
  selector: string,
  device: GPUDevice,
  canvasFormat: string
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas: HTMLCanvasElement = document.querySelector(selector)!;
  // deno-lint-ignore no-explicit-any
  const context: any = canvas.getContext('webgpu')!;

  // const devicePixelRatio = window.devicePixelRatio;
  // canvas.width = canvas.clientWidth * devicePixelRatio;
  // canvas.height = canvas.clientHeight * devicePixelRatio;

  context.configure({
    device,
    format: canvasFormat,
    alphaMode: 'premultiplied',
  });
  return [canvas, context];
}

async function loadSceneFile(device: GPUDevice, sceneName: SceneFile) {
  const start = getProfilerTimestamp();
  const timers: string[] = [];
  const addTimer = (name: string, start: number) =>
    timers.push(`${name}: ${getDeltaFromTimestampMS(start).toFixed(2)}ms`);

  // enable dev tools
  const { enableProfiler } = CONFIG.nanite.preprocess;
  if (enableProfiler) {
    console.profile('scene-loading');
  }

  const scene = SCENES[sceneName];
  const objFileResp = await fetch(scene.file);
  if (!objFileResp.ok) {
    throw `Could not download mesh file '${scene.file}'`;
  }
  const fileStr = await objFileResp.text();
  addTimer('OBJ fetch', start);

  const result = await loadScene(
    device,
    sceneName,
    fileStr,
    scene.scale,
    addTimer
  );

  const delta = getDeltaFromTimestampMS(start);
  addTimer('---TOTAL---', start);
  STATS.update('Preprocessing', `${delta.toFixed(0)}ms`);
  console.log('Mesh loading timers:', timers);
  if (enableProfiler) {
    console.profileEnd();
  }

  return result;
}

function showErrorMessage(msg?: string) {
  hideHtmlEl(document.getElementById('gpuCanvas'));
  showHtmlEl(document.getElementById('no-webgpu'), 'flex');
  if (msg) {
    document.getElementById('error-msg')!.textContent = msg;
  }
}
