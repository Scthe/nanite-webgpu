import { createErrorSystem, createGpuDevice } from './utils/index.ts';
import { createInputHandler } from './sys_web/input.ts';
import { Renderer, injectShaderTexts } from './renderer.ts';
import { initFPSCounter } from './sys_web/fpsStats.ts';
import { initializeGUI, onGpuProfilerResult } from './sys_web/gui.ts';
import { GpuProfiler } from './gpuProfiler.ts';
import { initCanvasResizeSystem } from './sys_web/cavasResize.ts';

//@ts-ignore it works OK
import drawMeshShader from './passes/drawMeshPass.wgsl';
import { loadObjFile } from './loaders/objLoader.ts';

// fix some warnings if VSCode is in deno mode
declare global {
  // deno-lint-ignore no-explicit-any
  function requestAnimationFrame(cb: any): void;
  // deno-lint-ignore no-explicit-any
  type HTMLCanvasElement = any;
  // deno-lint-ignore no-explicit-any
  type CanvasRenderingContext2D = any;
  // deno-lint-ignore no-explicit-any
  const document: any;
}

const SCENE_FILE = 'bunny.obj';
// const SCENE_FILE = 'cube.obj';
// const SCENE_FILE = 'plane.obj';

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
  const canvasSize = initCanvasResizeSystem(canvas);

  // input
  const getInputState = createInputHandler(window, canvas);

  // file load
  const mesh = await loadScene(device, SCENE_FILE);

  // renderer setup
  const profiler = new GpuProfiler(device);
  injectShaderTexts({
    drawMeshShader,
  });
  const renderer = new Renderer(
    device,
    canvasSize.getViewportSize(),
    PREFERRED_CANVAS_FORMAT
  );
  canvasSize.addListener(renderer.onCanvasResize);

  initializeGUI(profiler);
  const [fpsOnFrameStart, fpsOnFrameEnd] = initFPSCounter();
  let lastFrameMS = Date.now();
  let done = false;

  const lastError = await errorSystem.reportErrorScopeAsync();
  if (lastError) {
    showErrorMessage(lastError);
    return;
  }

  // frame callback
  const frame = () => {
    errorSystem.startErrorScope('frame');

    fpsOnFrameEnd();
    fpsOnFrameStart();
    profiler.beginFrame();
    const now = Date.now();
    const deltaTime = (now - lastFrameMS) / 1000;
    lastFrameMS = now;

    canvasSize.revalidateCanvasSize();

    const inputState = getInputState();
    renderer.updateCamera(deltaTime, inputState);

    // record commands
    const cmdBuf = device.createCommandEncoder({
      label: 'main-frame-cmd-buffer',
    });
    renderer.cmdRender(
      {
        cmdBuf,
        device,
        profiler,
        mesh,
        viewport: canvasSize.getViewportSize(),
      },
      canvasContext.getCurrentTexture()
    );

    // submit commands
    profiler.endFrame(cmdBuf);
    device.queue.submit([cmdBuf.finish()]);

    profiler.scheduleRaportIfNeededAsync(onGpuProfilerResult);

    // frame end
    if (!done) {
      errorSystem.reportErrorScopeAsync((lastError) => {
        showErrorMessage(lastError);
        done = true;
        throw new Error(lastError);
      }); // not awaited!

      requestAnimationFrame(frame);
    }
  };

  // start rendering
  requestAnimationFrame(frame);
})();

function getCanvasContext(
  selector: string,
  device: GPUDevice,
  canvasFormat: string
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.querySelector(selector);
  const context = canvas.getContext('webgpu');

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

async function loadScene(device: GPUDevice, path: string) {
  const objFileResp = await fetch(path);
  if (!objFileResp.ok) {
    throw `Could not download mesh file '${path}'`;
  }
  const fileStr = await objFileResp.text();
  return loadObjFile(device, fileStr);
}

function showErrorMessage(msg?: string) {
  document.getElementById('gpuCanvas').style.display = 'none';
  document.getElementById('no-webgpu').style.display = 'flex';
  if (msg) {
    document.getElementById('error-msg').textContent = msg;
  }
}
