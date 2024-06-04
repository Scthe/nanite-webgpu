/**************
 * Copied from official webgpu-samples repo under
 * 'BSD 3-Clause "New" or "Revised" License'.
 *
 * https://github.com/webgpu/webgpu-samples/blob/main/LICENSE.txt
 * https://webgpu.github.io/webgpu-samples/?sample=cameras
 */

// deno-lint-ignore no-explicit-any
type KeyboardEvent = any;
// deno-lint-ignore no-explicit-any
type PointerEvent = any;
// deno-lint-ignore no-explicit-any
type WheelEvent = any;
// deno-lint-ignore no-explicit-any
type HTMLCanvasElement = any;

const Key = {
  CAMERA_FORWARD: 'w',
  CAMERA_BACK: 's',
  CAMERA_LEFT: 'a',
  CAMERA_RIGHT: 'd',
  CAMERA_UP: ' ',
  CAMERA_DOWN: 'z',
};

// Input holds as snapshot of input state
export default interface Input {
  // Digital input (e.g keyboard state)
  readonly directions: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
  };
  // Analog input (e.g mouse, touchscreen)
  readonly mouse: {
    x: number;
    y: number;
    zoom: number;
    touching: boolean;
  };
}

export const createMockInputState = (): Input => ({
  directions: {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  },
  mouse: {
    x: 0,
    y: 0,
    zoom: 0,
    touching: false,
  },
});

// InputHandler is a function that when called, returns the current Input state.
export type InputHandler = () => Input;

// createInputHandler returns an InputHandler by attaching event handlers to the window and canvas.
export function createInputHandler(
  window: Window,
  canvas: HTMLCanvasElement
): InputHandler {
  const directions: Input['directions'] = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    up: false,
    down: false,
  };
  const mouse: Input['mouse'] = {
    x: 0,
    y: 0,
    zoom: 0,
    touching: false,
  };

  const setDigital = (e: KeyboardEvent, value: boolean) => {
    switch (e.key) {
      case Key.CAMERA_FORWARD:
        directions.forward = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case Key.CAMERA_BACK:
        directions.backward = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case Key.CAMERA_LEFT:
        directions.left = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case Key.CAMERA_RIGHT:
        directions.right = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case Key.CAMERA_UP:
        directions.up = value;
        e.preventDefault();
        e.stopPropagation();
        break;
      case Key.CAMERA_DOWN:
        directions.down = value;
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  };

  window.addEventListener('keydown', (e) => setDigital(e, true));
  window.addEventListener('keyup', (e) => setDigital(e, false));

  canvas.style.touchAction = 'pinch-zoom';
  canvas.addEventListener('pointerdown', () => {
    mouse.touching = true;
  });
  canvas.addEventListener('pointerup', () => {
    mouse.touching = false;
  });
  canvas.addEventListener('pointermove', (e: PointerEvent) => {
    mouse.touching = e.pointerType == 'mouse' ? (e.buttons & 1) !== 0 : true;
    if (mouse.touching) {
      mouse.x += e.movementX;
      mouse.y += e.movementY;
    }
  });
  canvas.addEventListener(
    'wheel',
    (e: WheelEvent) => {
      mouse.touching = (e.buttons & 1) !== 0;
      if (mouse.touching) {
        mouse.zoom += Math.sign(e.deltaY);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    { passive: false }
  );

  return () => {
    const out: Input = {
      directions: { ...directions },
      mouse: { ...mouse },
    };
    // Clear the analog values, as these accumulate.
    mouse.x = 0;
    mouse.y = 0;
    mouse.zoom = 0;
    return out;
  };
}
