import { BYTES_U8_VEC4 } from '../constants.ts';
import { Dimensions, clamp } from './index.ts';

const toUNorm8 = (a: number) => {
  a = a < 1 ? a * 255 : a;
  return Math.floor(clamp(a, 0, 255));
};

export function createFallbackTexture(
  device: GPUDevice,
  color: [number, number, number]
) {
  const size: Dimensions = { width: 4, height: 4 };
  const channelCnt = 4; // 1 byte each

  const texture = device.createTexture({
    label: 'fallback-texture-0',
    dimension: '2d',
    size: [size.width, size.height, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  // fill data
  const data = new Uint8Array(size.width * size.height * channelCnt);
  for (let x = 0; x < size.width; x++) {
    for (let y = 0; y < size.height; y++) {
      const offset = (x * size.width + y) * channelCnt;
      data[offset] = toUNorm8(color[0]); // 0-255
      data[offset + 1] = toUNorm8(color[1]); // 0-255
      data[offset + 2] = toUNorm8(color[2]); // 0-255
      data[offset + 3] = 255;
    }
  }

  device.queue.writeTexture(
    { texture },
    data,
    { bytesPerRow: size.width * BYTES_U8_VEC4 },
    [size.width, size.height]
  );
  return texture;
}

/** https://webgpu.github.io/webgpu-samples/?sample=texturedCube#main.ts */
export async function createTextureFromFile(device: GPUDevice, path: string) {
  const response = await fetch(path);
  const imageBitmap = await createImageBitmap(await response.blob());

  const texture = device.createTexture({
    label: 'fallback-texture-1',
    dimension: '2d',
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });
  // deno-lint-ignore no-explicit-any
  (device.queue as any).copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: texture },
    [imageBitmap.width, imageBitmap.height]
  );

  return texture;
}
