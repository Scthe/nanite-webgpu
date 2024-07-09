import { createGpuDevice } from './utils/webgpu.ts';
import { createInputHandler } from './sys_web/input.ts';
import { Renderer } from './renderer.ts';
import { STATS } from './sys_web/stats.ts';
import { initializeGUI, onGpuProfilerResult } from './sys_web/gui.ts';
import { GpuProfiler } from './gpuProfiler.ts';
import { initCanvasResizeSystem } from './sys_web/cavasResize.ts';
import { CONFIG, MILISECONDS_TO_SECONDS } from './constants.ts';
import { createErrorSystem } from './utils/errors.ts';
import { downloadDrawnMeshletsBuffer } from './scene/naniteBuffers/drawnMeshletsBuffer.ts';
import { showHtmlEl, hideHtmlEl } from './utils/index.ts';
import { ObjectLoadingProgressCb, Scene, loadScene } from './scene/scene.ts';
import { SceneName } from './scene/sceneFiles.ts';
import {
  setNaniteDrawStats,
  setNaniteDrawStatsHw_Sw,
} from './passes/_shared.ts';

// const SCENE_FILE: SceneName = 'singleBunny';
// const SCENE_FILE: SceneName = 'bunnyRow';
// const SCENE_FILE: SceneName = 'bunny1b';
// const SCENE_FILE: SceneName = 'bunny';
// const SCENE_FILE: SceneName = 'manyObjects';
const SCENE_FILE: SceneName = 'jinx';
// const SCENE_FILE: SceneName = 'planeSubdiv';
// const SCENE_FILE: SceneName = 'singleLucy';
// const SCENE_FILE: SceneName = 'dragon';
// const SCENE_FILE: SceneName = 'displacedPlane';
// const SCENE_FILE: SceneName = 'displacedPlaneFlat'; // fails
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
    showErrorMessage(e.message);
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

  // init ended, report errors
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
    const screenTexture = canvasResizeSystem.getScreenTextureView();
    renderer.cmdRender(cmdBuf, scene, screenTexture);

    // submit commands
    profiler.endFrame(cmdBuf);
    device.queue.submit([cmdBuf.finish()]);

    profiler.scheduleRaportIfNeededAsync(onGpuProfilerResult);

    // download GPU visibility buffer if needed
    if (CONFIG.nanite.render.nextFrameDebugVisiblityBuffer) {
      CONFIG.nanite.render.nextFrameDebugVisiblityBuffer = false;
      getGPUVisiblityStats(device, scene); // not awaited!
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
  const reportEl = document.getElementById('loader-text');
  const setReportText = (msg: string) => {
    // console.log(msg);
    if (reportEl != undefined) reportEl.textContent = msg;
    return new Promise((resolve) => setTimeout(resolve));
  };
  let lastReportedPercent = -1;
  const progCb: ObjectLoadingProgressCb = async (objName, p): Promise<void> => {
    if (typeof p === 'string') {
      await setReportText(p);
    } else {
      const percent = Math.floor(p * 100);
      if (percent !== lastReportedPercent && percent % 10 === 0) {
        lastReportedPercent = percent;
        await setReportText(`Loading '${objName}': ${percent}%`);
      }
    }
  };

  return loadScene(device, sceneName, progCb);
}

function showErrorMessage(msg?: string) {
  hideHtmlEl(document.getElementById('gpuCanvas'));
  showHtmlEl(document.getElementById('no-webgpu'), 'flex');
  if (msg) {
    document.getElementById('error-msg')!.textContent = msg;
  }
}

/** WARNING: SLOW! */
async function getGPUVisiblityStats(device: GPUDevice, scene: Scene) {
  // TODO [NOW] add impostor count?
  let drawnMeshlets = 0;
  let drawnTriangles = 0;
  let drawnMeshletsHW = 0;
  let drawnTrianglesHW = 0;
  let drawnMeshletsSW = 0;
  let drawnTrianglesSW = 0;

  const resultsAsync = scene.naniteObjects.map(async (obj) => {
    const { hardwareRaster, softwareRaster } =
      await downloadDrawnMeshletsBuffer(device, obj);

    drawnMeshlets += hardwareRaster.meshletCount + softwareRaster.meshletCount;
    drawnMeshletsHW += hardwareRaster.meshletCount;
    drawnMeshletsSW += softwareRaster.meshletCount;

    const getTriCnt = (meshletId: number) => {
      const meshlet = obj.find(meshletId);
      return meshlet ? meshlet.triangleCount : 0;
    };

    for (let i = 0; i < hardwareRaster.meshletCount; i++) {
      const meshletId = hardwareRaster.meshletIds[i].meshletId;
      const tris = getTriCnt(meshletId);
      drawnTriangles += tris;
      drawnTrianglesHW += tris;
    }

    for (let i = 0; i < softwareRaster.meshletCount; i++) {
      const meshletId = softwareRaster.meshletIds[i].meshletId;
      const tris = getTriCnt(meshletId);
      drawnTriangles += tris;
      drawnTrianglesSW += tris;
    }
  });
  await Promise.all(resultsAsync);
  setNaniteDrawStats(scene, drawnMeshlets, drawnTriangles);
  setNaniteDrawStatsHw_Sw(
    drawnMeshletsHW,
    drawnTrianglesHW,
    drawnMeshletsSW,
    drawnTrianglesSW
  );
}
