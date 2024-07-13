// @deno-types="npm:@types/dat.gui@0.7.9"
import * as dat from 'dat.gui';
import {
  CONFIG,
  DisplayMode,
  SHADING_MODE_HW_SW_IMPOSTOR,
  SHADING_MODE_LOD_LEVEL,
  SHADING_MODE_MESHLET,
  SHADING_MODE_NORMALS,
  SHADING_MODE_PBR,
  SHADING_MODE_TRIANGLE,
} from '../constants.ts';
import { GpuProfiler, GpuProfilerResult } from '../gpuProfiler.ts';
import { Scene, getDebugTestObject } from '../scene/scene.ts';
import { Camera } from '../camera.ts';
import { showHtmlEl } from '../utils/index.ts';
import { resetNaniteStats } from '../passes/_shared.ts';

// https://github.com/Scthe/WebFX/blob/master/src/UISystem.ts#L13
// https://github.com/Scthe/gaussian-splatting-webgpu/blob/master/src/web/gui.ts

const MAX_DEPTH_PYRAMID_LEVEL = 14;

export let setDisplayMode: undefined | ((e: DisplayMode) => unknown) =
  undefined;

type GuiCtrl = dat.GUIController<Record<string, unknown>>;

export function initializeGUI(
  profiler: GpuProfiler,
  scene: Scene,
  camera: Camera
) {
  // let softwareBackfaceCullCtrl: GuiCtrl;
  let gpuFreezeVisiblityCtrl: GuiCtrl;
  // let gpuVisiblityImplCtrl: GuiCtrl;
  let _gpuShadingMode: GuiCtrl;
  let gpuSoftwareRasterizerThrsh: GuiCtrl;

  const gui = new dat.GUI();

  const dummyObject = {
    openGithub: () => {
      window.location.href = CONFIG.githubRepoLink;
    },
    profile: () => {
      profiler.profileNextFrame(true);
    },
    resetCamera: () => {
      camera.resetPosition();
    },
    getGpuDrawStats: () => {
      CONFIG.nanite.render.nextFrameDebugDrawnMeshletsBuffer = true;
    },
    showSwRasterAlert: () => {
      alert(
        "WebGPU does not support atomic<u64> yet. I can't output both depth and color data with just 32 bits. Depth and normals are the best we get. And even that is a squeeze. What you see is the default white color affected by lights."
      );
    },
  };

  // github
  gui.add(dummyObject, 'openGithub').name('GITHUB');

  // profiler
  gui.add(dummyObject, 'profile').name('Profile');

  // GPU stats
  const getGPUStatsCtrl = gui
    .add(dummyObject, 'getGpuDrawStats')
    .name('Get GPU stats');

  addNaniteFolder();
  addInstanceCullingFolder();
  addMeshletCullingFolder();
  addColorMgmt();
  addDbgFolder();

  // init visiblity
  onVisiblityDeviceSwap();

  function onVisiblityDeviceSwap() {
    const nextDevice = CONFIG.nanite.render.naniteDevice;

    resetNaniteStats();

    // gpu
    setVisible(getGPUStatsCtrl, nextDevice == 'gpu');
    setVisible(gpuFreezeVisiblityCtrl, nextDevice == 'gpu');
    setVisible(gpuSoftwareRasterizerThrsh, nextDevice == 'gpu');
    // setVisible(gpuVisiblityImplCtrl, nextDevice == 'gpu');
    // setVisible(gpuShadingMode, nextDevice == 'gpu'); // normals preview works on the CPU
    // cpu
    // setVisible(softwareBackfaceCullCtrl, nextDevice == 'cpu');
  }

  //////////////
  /// subdirs

  function addNaniteFolder() {
    const dir = gui.addFolder('Nanite');
    dir.open();

    // nanite device: GPU/CPU
    // prettier-ignore
    const naniteDeviceDummy = createDummy(CONFIG.nanite.render, 'naniteDevice', [
      { label: 'GPU', value: 'gpu' },
      { label: 'CPU', value: 'cpu' },
    ]);
    // prettier-ignore
    dir
      .add(naniteDeviceDummy, 'naniteDevice', naniteDeviceDummy.values) // prettier-ignore
      .name('Nanite device')
      .onFinishChange(onVisiblityDeviceSwap);

    // errorThreshold
    dir
      .add(CONFIG.nanite.render, 'errorThreshold', 0, 10)
      .name('Error threshold');

    // Visib. algo
    // gpuVisiblityImplCtrl = dir
    // .add(CONFIG.nanite.render, 'useVisibilityImpl_Iter')
    // .name('Visib. algo ITER');

    // shading mode
    // prettier-ignore
    const shadingDummy = createDummy(CONFIG.nanite.render, 'shadingMode', [
      { label: 'Shaded', value: SHADING_MODE_PBR },
      { label: 'Normals', value: SHADING_MODE_NORMALS },
      { label: 'Triangles', value: SHADING_MODE_TRIANGLE },
      { label: 'Meshlets', value: SHADING_MODE_MESHLET },
      { label: 'LOD levels', value: SHADING_MODE_LOD_LEVEL },
      { label: 'HW/SW/Impostor', value: SHADING_MODE_HW_SW_IMPOSTOR },
    ]);
    // prettier-ignore
    _gpuShadingMode = dir
      .add(shadingDummy, 'shadingMode', shadingDummy.values) // prettier-ignore
      .name('Shading mode');

    // freeze visibilty
    gpuFreezeVisiblityCtrl = dir
      .add(CONFIG.nanite.render, 'freezeGPU_Visibilty')
      .name('Freeze culling');

    dir
      .add(dummyObject, 'showSwRasterAlert')
      .name('Software rasterizer - README');

    const cfgSr = CONFIG.softwareRasterizer;
    dir.add(cfgSr, 'enabled').name('Softw. raster. enable');
    gpuSoftwareRasterizerThrsh = dir
      .add(cfgSr, 'threshold', 0.0, 2500.0)
      .name('Softw. raster. threshold [px]');
  }

  function addInstanceCullingFolder() {
    const dir = gui.addFolder('Instances culling');
    dir.open();
    const cfg = CONFIG.cullingInstances;
    const imp = CONFIG.impostors;

    dir.add(cfg, 'enabled').name('Enabled');
    dir.add(cfg, 'frustumCulling').name('Frustum culling');
    dir.add(cfg, 'occlusionCulling').name('Occlusion culling');
    dir
      .add(imp, 'billboardThreshold', 0.0, 8000.0)
      .name('Billboard threshold [px]');
    dir.add(imp, 'forceOnlyBillboards').name('Force billboards');
    dir.add(imp, 'ditherStrength', 0.0, 1.0).name('Billboard dither');
  }

  function addMeshletCullingFolder() {
    const dir = gui.addFolder('Meshlet culling');
    dir.open();
    const cfg = CONFIG.cullingMeshlets;
    const cfgNanite = CONFIG.nanite.render;

    // Frustum culling
    dir.add(cfg, 'frustumCulling').name('Frustum culling');

    // Occlusion culling
    dir.add(cfg, 'occlusionCulling').name('Occlusion culling');
    dir.add(cfgNanite, 'isOverrideOcclusionCullMipmap').name('OC override');
    dir
      .add(
        cfgNanite,
        'occlusionCullOverrideMipmapLevel',
        0,
        MAX_DEPTH_PYRAMID_LEVEL
      )
      .step(1)
      .name('OC ov-ride lvl');

    // SW backface cull
    // softwareBackfaceCullCtrl = dir
    // .add(cfg, 'useSoftwareBackfaceCull')
    // .name('SW backface cull');
  }

  function addColorMgmt() {
    const dir = gui.addFolder('Color mgmt');
    const cfg = CONFIG.colors;

    dir.add(cfg, 'gamma', 1.0, 3.0).name('Gamma');
    dir.add(cfg, 'exposure', 0.0, 2.0).name('Exposure');
    dir.add(cfg, 'ditherStrength', 0.0, 2.0).name('Dithering');
  }

  function addDbgFolder() {
    const dir = gui.addFolder('DEBUG');
    dir.open();

    // bg
    addColorController(dir, CONFIG, 'clearColor', 'Bg color');
    dir.add(CONFIG, 'useAlternativeClearColor').name('Alt. bg');
    dir.add(CONFIG, 'drawGround').name('Draw ground');

    // display mode
    const modeDummy = createDummy(CONFIG, 'displayMode', [
      { label: 'Nanite', value: 'nanite' },
      { label: 'DBG: lod', value: 'dbg-lod' },
      { label: 'DBG: lod meshlets', value: 'dbg-lod-meshlets' },
      { label: 'DBG: nanite meshlets', value: 'dbg-nanite-meshlets' },
      { label: 'DBG: depth pyramid', value: 'dbg-depth-pyramid' },
    ]);
    const modeCtrl = dir
      .add(modeDummy, 'displayMode', modeDummy.values)
      .name('Display mode');
    setDisplayMode = (e) => {
      CONFIG.displayMode = e;
      // deno-lint-ignore no-explicit-any
      (modeCtrl as any).__onFinishChange();
      modeCtrl.updateDisplay();
    };

    const [debugMeshes, naniteObject] = getDebugTestObject(scene);
    let maxLod = debugMeshes.meshoptimizerLODs.length - 1;
    const lodCtrl = dir
      .add(CONFIG, 'dbgMeshoptimizerLodLevel', 0, maxLod)
      .step(1)
      .name('LOD level');

    maxLod = naniteObject.lodLevelCount - 1; // 7 levels mean 0-6 on GUI
    const naniteLodCtrl = dir
      .add(CONFIG, 'dbgNaniteLodLevel', 0, maxLod)
      .step(1)
      .name('Nanite LOD');

    const depthPyramidLevelCtrl = dir
      .add(CONFIG, 'dbgDepthPyramidLevel', 0, MAX_DEPTH_PYRAMID_LEVEL)
      .step(1)
      .name('Pyramid level');

    modeCtrl.onFinishChange(onDisplayModeChange);

    // camera reset
    dir.add(dummyObject, 'resetCamera').name('Reset camera');

    // init
    onDisplayModeChange();

    function onDisplayModeChange() {
      // in case camera moves when in !nanite mode and depth buffer is obsolete
      // also executes during init, but should not crash anything
      CONFIG.nanite.render.hasValidDepthPyramid = false;

      const mode = CONFIG.displayMode;
      const showLod = ['dbg-lod', 'dbg-lod-meshlets'].includes(mode);
      setVisible(lodCtrl, showLod);
      setVisible(naniteLodCtrl, mode === 'dbg-nanite-meshlets');
      setVisible(depthPyramidLevelCtrl, mode === 'dbg-depth-pyramid');
    }
  }

  //////////////
  /// utils
  function addColorController<T extends object>(
    dir: dat.GUI,
    obj: T,
    prop: keyof T,
    name: string
  ) {
    const dummy = {
      value: [] as number[],
    };

    Object.defineProperty(dummy, 'value', {
      enumerable: true,
      get: () => {
        // deno-lint-ignore no-explicit-any
        const v = obj[prop] as any;
        return [v[0] * 255, v[1] * 255, v[2] * 255];
      },
      set: (v: number[]) => {
        // deno-lint-ignore no-explicit-any
        const a = obj[prop] as any as number[];
        a[0] = v[0] / 255;
        a[1] = v[1] / 255;
        a[2] = v[2] / 255;
      },
    });

    dir.addColor(dummy, 'value').name(name);
  }
}

function setVisible(ctrl: GuiCtrl, isVisible: boolean) {
  if (!ctrl) {
    // use stacktrace/debugger to identify which..
    console.error(`Not controller for gui element found!`);
    return;
  }

  // deno-lint-ignore no-explicit-any
  const parentEl: HTMLElement = (ctrl as any).__li;

  if (isVisible) {
    parentEl.style.display = '';
  } else {
    parentEl.style.display = 'none';
  }
}

interface UiOpts<T> {
  label: string;
  value: T;
}

// deno-lint-ignore ban-types
const createDummy = <V extends Object, K extends keyof V>(
  obj: V,
  key: K,
  opts: UiOpts<V[K]>[]
): { values: string[] } & Record<K, string> => {
  const dummy = {
    values: opts.map((o) => o.label),
  };

  Object.defineProperty(dummy, key, {
    enumerable: true,
    get: () => {
      const v = obj[key];
      const opt = opts.find((e) => e.value === v) || opts[0];
      return opt.label;
    },
    set: (selectedLabel: string) => {
      const opt = opts.find((e) => e.label === selectedLabel) || opts[0];
      obj[key] = opt.value;
    },
  });

  // TS ignores Object.defineProperty and thinks we have not complete object
  // deno-lint-ignore no-explicit-any
  return dummy as any;
};

export function onGpuProfilerResult(result: GpuProfilerResult) {
  console.log('Profiler:', result);
  const parentEl = document.getElementById('profiler-results')!;
  parentEl.innerHTML = '';
  // deno-lint-ignore no-explicit-any
  showHtmlEl(parentEl.parentNode as any);

  const mergeByName: Record<string, number> = {};
  const names = new Set<string>();
  result.forEach(([name, timeMs]) => {
    const t = mergeByName[name] || 0;
    mergeByName[name] = t + timeMs;
    names.add(name);
  });

  names.forEach((name) => {
    const timeMs = mergeByName[name];
    const li = document.createElement('li');
    li.innerHTML = `${name}: ${timeMs.toFixed(2)}ms`;
    parentEl.appendChild(li);
  });
}
