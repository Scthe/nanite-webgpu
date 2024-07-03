// @deno-types="npm:@types/dat.gui@0.7.9"
import * as dat from 'dat.gui';
import {
  CONFIG,
  DisplayMode,
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
  let getGPUStatsCtrl: GuiCtrl;
  // let softwareBackfaceCullCtrl: GuiCtrl;
  let gpuFreezeVisiblityCtrl: GuiCtrl;
  // let gpuVisiblityImplCtrl: GuiCtrl;
  let _gpuShadingMode: GuiCtrl;

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
      CONFIG.nanite.render.nextFrameDebugVisiblityBuffer = true;
    },
  };

  // github
  gui.add(dummyObject, 'openGithub').name('GITHUB');

  // bg
  addColorController(CONFIG, 'clearColor', 'Bg color');
  gui.add(CONFIG, 'useAlternativeClearColor').name('Alt. bg');

  // profiler
  gui.add(dummyObject, 'profile').name('Profile');

  addNaniteFolder();
  addInstanceCullingFolder();
  addCullingFolder();
  addDbgFolder();

  // init visiblity
  onVisiblityDeviceSwap();

  function onVisiblityDeviceSwap() {
    const nextDevice = CONFIG.nanite.render.calcVisibilityDevice;

    resetNaniteStats();

    // gpu
    setVisible(getGPUStatsCtrl, nextDevice == 'gpu');
    setVisible(gpuFreezeVisiblityCtrl, nextDevice == 'gpu');
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

    // nanite visibility calc - GPU/CPU
    // prettier-ignore
    const calcVisibilityDummy = createDummy(CONFIG.nanite.render, 'calcVisibilityDevice', [
      { label: 'GPU', value: 'gpu' },
      { label: 'CPU', value: 'cpu' },
    ]);
    // prettier-ignore
    dir
      .add(calcVisibilityDummy, 'calcVisibilityDevice', calcVisibilityDummy.values) // prettier-ignore
      .name('Visibility test')
      .onFinishChange(onVisiblityDeviceSwap);

    // pixelThreshold
    dir
      .add(CONFIG.nanite.render, 'pixelThreshold', 0, 10)
      .name('Error threshold [px]');

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
    ]);
    // prettier-ignore
    _gpuShadingMode = dir
      .add(shadingDummy, 'shadingMode', shadingDummy.values) // prettier-ignore
      .name('Shading mode');

    // freeze visibilty
    gpuFreezeVisiblityCtrl = dir
      .add(CONFIG.nanite.render, 'freezeGPU_Visibilty')
      .name('Freeze visibilty');

    // GPU stats
    getGPUStatsCtrl = dir
      .add(dummyObject, 'getGpuDrawStats')
      .name('Get GPU visibility stats');
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
      .add(imp, 'billboardThreshold', 0.0, 1000.0)
      .name('Billboard threshold [px]');
    dir.add(imp, 'forceOnlyBillboards').name('Force billboards');
    dir.add(imp, 'ditherStrength', 0.0, 1.0).name('Billboard dither');
  }

  function addCullingFolder() {
    const dir = gui.addFolder('Culling');
    dir.open();
    const { render } = CONFIG.nanite;

    // Frustum culling
    dir.add(render, 'useFrustumCulling').name('Frustum culling');

    // Occlusion culling
    dir.add(render, 'useOcclusionCulling').name('Occlusion culling');
    dir.add(render, 'isOverrideOcclusionCullMipmap').name('OC override');
    dir
      .add(
        render,
        'occlusionCullOverrideMipmapLevel',
        0,
        MAX_DEPTH_PYRAMID_LEVEL
      )
      .step(1)
      .name('OC ov-ride lvl');

    // SW backface cull
    // softwareBackfaceCullCtrl = dir
    // .add(CONFIG.nanite.render, 'useSoftwareBackfaceCull')
    // .name('SW backface cull');
  }

  function addDbgFolder() {
    const dir = gui.addFolder('DEBUG');
    dir.open();

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

    gui.addColor(dummy, 'value').name(name);
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
