import { createGpuDevice } from './utils/webgpu.ts';
import { createInputHandler } from './sys_web/input.ts';
import { Renderer } from './renderer.ts';
import { STATS } from './sys_web/stats.ts';
import { initializeGUI, onGpuProfilerResult } from './sys_web/gui.ts';
import { GpuProfiler } from './gpuProfiler.ts';
import { initCanvasResizeSystem } from './sys_web/cavasResize.ts';
import { CONFIG, MILISECONDS_TO_SECONDS } from './constants.ts';
import { createErrorSystem } from './utils/errors.ts';
import { downloadVisibilityBuffer } from './scene/naniteObject.ts';
import { DrawNanitesPass } from './passes/naniteCpu/drawNanitesPass.ts';
import { showHtmlEl, hideHtmlEl } from './utils/index.ts';
import { FileTextReader, Scene, loadScene } from './scene/scene.ts';
import { SceneName } from './scene/sceneFiles.ts';

const SCENE_FILE: SceneName = 'bunnyRow';
// const SCENE_FILE: SceneName = 'singleBunny';
// const SCENE_FILE: SceneName = 'lucy';
// const SCENE_FILE: SceneName = 'dragon'; // crashes WebAssembly cuz WebAssembly is..
// const SCENE_FILE: SceneName = 'displacedPlane';
// const SCENE_FILE: SceneName = 'cube';
// const SCENE_FILE: SceneName = 'plane';

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
  const renderer = new Renderer(
    device,
    canvasResizeSystem.getViewportSize(),
    PREFERRED_CANVAS_FORMAT,
    profiler
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
          undefined,
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

function loadSceneFile(device: GPUDevice, sceneName: SceneName) {
  const fileTextReader: FileTextReader = async (filename: string) => {
    const objFileResp = await fetch(filename);
    if (!objFileResp.ok) {
      throw `Could not download mesh file '${filename}'`;
    }
    return objFileResp.text();
  };

  return loadScene(device, fileTextReader, sceneName);
}

function showErrorMessage(msg?: string) {
  hideHtmlEl(document.getElementById('gpuCanvas'));
  showHtmlEl(document.getElementById('no-webgpu'), 'flex');
  if (msg) {
    document.getElementById('error-msg')!.textContent = msg;
  }
}
