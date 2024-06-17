import { CONFIG } from '../constants.ts';
import { CalcVisibilityDevice } from '../constants.ts';
import { getProfilerTimestamp } from '../gpuProfiler.ts';
import { hideHtmlEl, isHtmlElVisible, showHtmlEl } from '../utils/index.ts';

type StatsValue = number | string;

type StatOpts = {
  hideLabel?: boolean;
  el?: HTMLElement;
  visibilityDevice?: CalcVisibilityDevice;
  categoryName?: string;
};

// prettier-ignore
const AvailableStats = {
  fps: { hideLabel: true } as StatOpts,
  ms: { hideLabel: true } as StatOpts,
  'Camera pos': {} as StatOpts,
  'Camera rot': {} as StatOpts,
  // memory
  s0: { categoryName: 'Memory' } as StatOpts,
  'Vertex buffer': { visibilityDevice: 'cpu' } as StatOpts,
  'Vertex buffer2': { visibilityDevice: 'gpu' } as StatOpts,
  'Index buffer': {} as StatOpts,
  'Meshlets data': { visibilityDevice: 'gpu' } as StatOpts,
  'Visibility buffer': { visibilityDevice: 'gpu' } as StatOpts,
  // Geometry
  s1: { categoryName: 'Geometry' } as StatOpts,
  'Preprocessing': {} as StatOpts,
  'Pre-Nanite meshlets': {} as StatOpts,
  'Pre-Nanite triangles': {} as StatOpts,
  'Nanite meshlets': {} as StatOpts,
  'Nanite triangles': { visibilityDevice: 'cpu' } as StatOpts,
  'Culled instances': { visibilityDevice: 'cpu' } as StatOpts,
  'Visibility wkgrp': { visibilityDevice: 'gpu' } as StatOpts,
};
type StatName = keyof typeof AvailableStats;

const DELTA_SMOOTHING = 0.95;
const UPDATE_FREQ_MS = 1000;

class Stats {
  // deno-lint-ignore no-explicit-any
  private values: Record<StatName, number | string> = {} as any;
  private lastRenderedValues: Record<string, number | string> = {};
  //
  private frameStart: number = 0;
  public deltaTimeMS = 0;
  private deltaTimeSmoothMS: number | undefined = undefined;
  // HTML
  private parentEl: HTMLElement;
  private lastDOMUpdate: number = 0;

  constructor() {
    // deno-lint-ignore no-window
    if (window && window.document) {
      this.parentEl = window.document.getElementById('stats-window')!;
      this.frameStart = getProfilerTimestamp();
      this.lastDOMUpdate = this.frameStart;
    } else {
      this.parentEl = undefined!;
    }

    this.values['Nanite meshlets'] = '-';
  }

  update(name: StatName, value: StatsValue) {
    this.values[name] = value;
  }

  show = () => showHtmlEl(this.parentEl);

  onBeginFrame = () => {
    this.frameStart = getProfilerTimestamp();
  };

  onEndFrame = () => {
    const frameEnd = getProfilerTimestamp();
    this.deltaTimeMS = frameEnd - this.frameStart;

    if (this.deltaTimeSmoothMS === undefined) {
      this.deltaTimeSmoothMS = this.deltaTimeMS;
    } else {
      // lerp
      this.deltaTimeSmoothMS =
        this.deltaTimeSmoothMS * DELTA_SMOOTHING +
        this.deltaTimeMS * (1.0 - DELTA_SMOOTHING);
    }

    const fps = (1.0 / this.deltaTimeMS) * 1000;
    this.update('fps', `${fps.toFixed(2)} fps`);
    this.update('ms', `${this.deltaTimeMS.toFixed(2)}ms`);

    if (frameEnd - this.lastDOMUpdate > UPDATE_FREQ_MS) {
      this.lastDOMUpdate = frameEnd;
      setTimeout(this.renderStats, 0);
    }
  };

  private renderStats = () => {
    const statsChildrenEls: HTMLElement[] = Array.from(
      this.parentEl.children
      // deno-lint-ignore no-explicit-any
    ) as any;

    Object.entries(AvailableStats).forEach(([name_, opts]) => {
      // deno-lint-ignore no-explicit-any
      const name: StatName = name_ as any; // ...TS
      const el = this.getStatsHtmlEl(statsChildrenEls, name, opts);

      if (opts.categoryName) {
        if (el.textContent !== opts.categoryName)
          el.innerHTML = opts.categoryName;
        el.classList.add('stats-category-name');
        return;
      }

      // do not update if not visible
      if (!this.checkVisibility(opts, el)) return;

      // do not update if not changed
      const value = this.values[name];
      const shownValue = this.lastRenderedValues[name];
      // if (name === 'Nanite triangles') console.log({ value, shownValue }); // dbg
      if (value == shownValue) return;

      let text = `${name}: ${value}`;
      if (opts.hideLabel) {
        text = String(value);
      }
      el.innerHTML = text;
    });

    this.lastRenderedValues = { ...this.values };
  };

  private getStatsHtmlEl = (
    els: HTMLElement[],
    name: StatName,
    opts: StatOpts
  ): HTMLElement => {
    const STATS_ATTR = 'data-stats-attr';

    if (opts.el) return opts.el;
    let el = els.find(
      (el: HTMLElement) => el.getAttribute(STATS_ATTR) === name
    );

    if (!el) {
      el = document.createElement('p');
      el.setAttribute(STATS_ATTR, name);
      this.parentEl.appendChild(el);
    }
    opts.el = el;
    return el;
  };

  private checkVisibility(opts: StatOpts, el: HTMLElement) {
    if (!opts.visibilityDevice) return true;

    const nextVisible =
      opts.visibilityDevice === CONFIG.nanite.render.calcVisibilityDevice;
    this.setElVisible(el, nextVisible);
    return nextVisible;
  }

  setElVisible(el: HTMLElement, nextVisible: boolean) {
    if (nextVisible && !isHtmlElVisible(el)) {
      // console.log('setElVisible', el, nextVisible);
      showHtmlEl(el);
      this.lastRenderedValues = {}; // force rerender all
    }
    if (!nextVisible && isHtmlElVisible(el)) {
      // console.log('setElVisible', el, nextVisible);
      hideHtmlEl(el);
      this.lastRenderedValues = {}; // force rerender all
    }
  }
}

export const STATS = new Stats();
