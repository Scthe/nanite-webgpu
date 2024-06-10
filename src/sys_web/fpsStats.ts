import { STATS } from '../constants.ts';
import { lerp } from '../utils/index.ts';

// deno-lint-ignore no-explicit-any
type HTMLElement = any;

const DELTA_SMOOTHING = 0.9;
const UPDATE_FREQ_MS = 1000;

export function initFPSCounter() {
  const parentEl = document.getElementById('stats-window');
  const fpsEl = document.createElement('p');
  const msEl = document.createElement('p');
  parentEl.appendChild(fpsEl);
  parentEl.appendChild(msEl);
  parentEl.style.display = 'block';

  let frameStart = performance.now();
  let smoothDelta: number | undefined = undefined;
  let lastDOMUpdate: number = frameStart;

  return [
    () => {
      frameStart = performance.now();
    },
    () => {
      const frameEnd = performance.now();
      const deltaMs = frameEnd - frameStart;
      if (smoothDelta === undefined) {
        smoothDelta = deltaMs;
      } else {
        smoothDelta = lerp(smoothDelta, deltaMs, 1 - DELTA_SMOOTHING);
      }

      if (frameEnd - lastDOMUpdate > UPDATE_FREQ_MS) {
        lastDOMUpdate = frameEnd;
        updateDOM();
      }
    },
  ];

  function updateDOM() {
    if (smoothDelta === undefined) return;

    const fps = (1.0 / smoothDelta) * 1000;
    fpsEl.innerHTML = `${fps.toFixed(2)} fps`;
    msEl.innerHTML = `${smoothDelta.toFixed(2)}ms`;

    const STATS_ATTR = 'data-stats-attr';
    const statsChildrenEls = Array.from(parentEl.children);
    Object.entries(STATS).forEach(([k, v]) => {
      let el: HTMLElement = statsChildrenEls.find(
        (el: HTMLElement) => el.getAttribute(STATS_ATTR) === k
      );

      if (!el) {
        el = document.createElement('p');
        el.setAttribute(STATS_ATTR, k);
        parentEl.appendChild(el);
      }
      el.innerHTML = `${k}${v}`;
    });
  }
}
