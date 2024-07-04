import { Dimensions } from '../utils/index.ts';

export type ResizeHandler = (viewportSize: Dimensions) => void;

export function initCanvasResizeSystem(
  canvas: HTMLCanvasElement,
  canvasContext: CanvasRenderingContext2D
) {
  const sizeNow = getViewportSize();
  canvas.width = sizeNow.width;
  canvas.height = sizeNow.height;
  console.log('Init canvas size:', sizeNow);

  const listeners: ResizeHandler[] = [];
  const addListener = (f: ResizeHandler) => listeners.push(f);

  // Has nothing to do with resize actually.
  const getScreenTextureView = (): GPUTextureView =>
    canvasContext.getCurrentTexture().createView();

  return {
    revalidateCanvasSize,
    addListener,
    getViewportSize,
    getScreenTextureView,
  };

  function revalidateCanvasSize() {
    const sizeNow = getViewportSize();
    const hasChanged =
      sizeNow.width !== canvas.width || sizeNow.height !== canvas.height;

    if (hasChanged && sizeNow.width && sizeNow.height) {
      applyResize(sizeNow);
    }
  }

  function applyResize(d: Dimensions) {
    // console.log('Canvas resize:', d);
    canvas.width = d.width;
    canvas.height = d.height;
    listeners.forEach((l) => l(d));
  }

  function getViewportSize(): Dimensions {
    // deno-lint-ignore no-explicit-any
    const devicePixelRatio = (window as any).devicePixelRatio || 1;
    return {
      width: canvas.clientWidth * devicePixelRatio,
      height: canvas.clientHeight * devicePixelRatio,
    };
  }
}
