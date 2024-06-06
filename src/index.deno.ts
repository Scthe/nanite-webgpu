import { getRowPadding, createCapture } from 'std/webgpu';
import * as png from 'png';

import { Dimensions, createGpuDevice } from './utils/index.ts';
import { Renderer, ShadersTexts, injectShaderTexts } from './renderer.ts';
import { loadObjFile } from './scene/objLoader.ts';

// https://deno.land/std@0.209.0/webgpu/mod.ts
// createTextureWithData: https://deno.land/std@0.209.0/webgpu/texture_with_data.ts?s=createTextureWithData

const SCENE_FILE = 'static/bunny.obj';
const VIEWPORT_SIZE: Dimensions = {
  width: 1270,
  height: 720,
};
const PREFERRED_CANVAS_FORMAT = 'rgba8unorm-srgb';

// GPUDevice
const device = await createGpuDevice();
if (!device) Deno.exit(1);

// create canvas
const { texture: windowTexture, outputBuffer } = createCapture(
  device,
  VIEWPORT_SIZE.width,
  VIEWPORT_SIZE.height
);

// file load
const mesh = await loadScene(device, SCENE_FILE);

// renderer setup
injectShaderTexts(getShaderTexts());
const renderer = new Renderer(device, VIEWPORT_SIZE, PREFERRED_CANVAS_FORMAT);

// record commands
const cmdBuf = device.createCommandEncoder({
  label: 'main-frame-cmd-buffer',
});
renderer.cmdRender(
  {
    cmdBuf,
    device,
    profiler: undefined,
    viewport: VIEWPORT_SIZE,
    mesh,
  },
  windowTexture
);
cmdCopyTextureToBuffer(cmdBuf, windowTexture, outputBuffer, VIEWPORT_SIZE);
// submit commands
device.queue.submit([cmdBuf.finish()]);

// write output
await writePng('./output.png', outputBuffer, VIEWPORT_SIZE);

/////////////////////
/// UTILS

function getShaderTexts(): ShadersTexts {
  return {
    drawMeshShader: Deno.readTextFileSync('src/passes/drawMeshPass.wgsl'),
  };
}

async function loadScene(device: GPUDevice, path: string) {
  const rawtext = await Deno.readTextFileSync(path);
  const mesh = loadObjFile(device, rawtext);
  return mesh;
}

function cmdCopyTextureToBuffer(
  cmdBuf: GPUCommandEncoder,
  texture: GPUTexture,
  outputBuffer: GPUBuffer,
  dimensions: Dimensions
): void {
  const { padded } = getRowPadding(dimensions.width);

  cmdBuf.copyTextureToBuffer(
    { texture },
    {
      buffer: outputBuffer,
      bytesPerRow: padded,
    },
    dimensions
  );
}

async function writePng(
  filepath: string,
  buffer: GPUBuffer,
  dimensions: Dimensions
): Promise<void> {
  console.log(`Writing result PNG to: ${filepath}`);
  try {
    await buffer.mapAsync(1);
    const inputBuffer = new Uint8Array(buffer.getMappedRange());
    const { padded, unpadded } = getRowPadding(dimensions.width);
    const outputBuffer = new Uint8Array(unpadded * dimensions.height);

    for (let i = 0; i < dimensions.height; i++) {
      const slice = inputBuffer
        .slice(i * padded, (i + 1) * padded)
        .slice(0, unpadded);

      outputBuffer.set(slice, i * unpadded);
    }

    const image = png.encode(
      outputBuffer,
      dimensions.width,
      dimensions.height,
      {
        stripAlpha: true,
        color: 2,
      }
    );
    Deno.writeFileSync(filepath, image);
  } finally {
    buffer.unmap();
  }
}
