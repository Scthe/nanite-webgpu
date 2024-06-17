// @deno-types="npm:@types/dat.gui@0.7.9"
import * as dat from 'dat.gui';
import { CONFIG, DisplayMode } from '../constants.ts';
import { GpuProfiler, GpuProfilerResult } from '../gpuProfiler.ts';
import { Scene } from '../scene/scene.ts';
import { Camera } from '../camera.ts';
import { DrawNanitesPass } from '../passes/naniteCpu/drawNanitesPass.ts';
import { showHtmlEl } from '../utils/index.ts';

// https://github.com/Scthe/WebFX/blob/master/src/UISystem.ts#L13
// https://github.com/Scthe/gaussian-splatting-webgpu/blob/master/src/web/gui.ts

export function initializeGUI(
  profiler: GpuProfiler,
  scene: Scene,
  camera: Camera
) {
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

  // profiler
  gui.add(dummyObject, 'profile').name('Profile');

  addNaniteFolder();
  addDbgFolder();

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
      .onFinishChange(()=>{
        DrawNanitesPass.updateRenderStats(undefined, undefined, undefined);
      })

    // profiler
    dir.add(dummyObject, 'getGpuDrawStats').name('Get GPU visibility stats');

    // pixelThreshold
    dir
      .add(CONFIG.nanite.render, 'pixelThreshold', 0, 10)
      .name('Error threshold [px]');

    // culling
    dir.add(CONFIG.nanite.render, 'useFrustumCulling').name('Frustum culling');
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
    ]);
    const modeCtrl = dir
      .add(modeDummy, 'displayMode', modeDummy.values)
      .name('Display mode');

    let maxLod = scene.debugMeshes.meshoptimizerLODs.length - 1;
    const toggleLodCtrl = addLODController(
      dir,
      'dbgMeshoptimizerLodLevel',
      'LOD level',
      maxLod,
      ['dbg-lod', 'dbg-lod-meshlets']
    );

    maxLod = scene.naniteObject.lodLevelCount - 1; // 7 levels mean 0-6 on GUI

    const naniteLodToggle = addLODController(
      dir,
      'dbgNaniteLodLevel',
      'Nanite LOD',
      maxLod,
      ['dbg-nanite-meshlets']
    );
    modeCtrl.onFinishChange(() => {
      toggleLodCtrl();
      naniteLodToggle();
    });

    // camera reset
    dir.add(dummyObject, 'resetCamera').name('Reset camera');
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

function addLODController(
  gui: dat.GUI,
  propName: keyof typeof CONFIG,
  name: string,
  maxLod: number,
  visibility: DisplayMode[]
) {
  gui.add(CONFIG, propName, 0, maxLod).step(1).name(name);
  const toggleLodCtrl = () => {
    setVisible(gui, propName, visibility.includes(CONFIG.displayMode));
  };
  toggleLodCtrl(); // set initial visibility
  return toggleLodCtrl;
}

function getController(gui: dat.GUI, name: string) {
  let controller = null;
  const controllers = gui.__controllers;

  for (let i = 0; i < controllers.length; i++) {
    const c = controllers[i];
    if (c.property == name) {
      controller = c;
      break;
    }
  }
  return controller;
}

function setVisible(gui: dat.GUI, name: string, isVisible: boolean) {
  // deno-lint-ignore no-explicit-any
  const ctrl = getController(gui, name) as any; // uses non public API
  if (!ctrl) {
    console.error(`Not controller for '${name}' found`);
    return;
  }

  if (isVisible) {
    ctrl.__li.style.display = '';
  } else {
    ctrl.__li.style.display = 'none';
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
