import * as png from 'png';
import { BYTES_U8 } from '../constants.ts';
import {
  BinaryFileReader,
  TextFileReader,
  TextureReader,
} from '../scene/load/types.ts';

// deno-lint-ignore require-await
export const textFileReader_Deno: TextFileReader = async (filename: string) => {
  return Deno.readTextFileSync(filename);
};

export const binaryFileReader_Deno: BinaryFileReader = async (
  filename: string
) => {
  const rawFileData = await Deno.readFile(filename);
  return rawFileData.buffer;
};

// deno-lint-ignore require-await
export const createTextureFromFile_Deno: TextureReader = async (
  device: GPUDevice,
  path: string,
  format: GPUTextureFormat,
  usage: GPUTextureUsageFlags
) => {
  const rawFileData = Deno.readFileSync(path);
  const pngFile = png.decode(rawFileData);

  let data: Uint8Array;
  if (pngFile.colorType === png.ColorType.RGB) {
    data = convertRGB_to_RGBA(pngFile.image);
  } else if (pngFile.colorType === png.ColorType.RGBA) {
    data = pngFile.image;
  } else {
    throw new Error(`Invalid texture colorType: ${pngFile.colorType} for file '${path}'`); // prettier-ignore
  }

  const texture = device.createTexture({
    label: path,
    dimension: '2d',
    size: { width: pngFile.width, height: pngFile.height },
    format,
    usage,
  });

  device.queue.writeTexture(
    { texture },
    data,
    { bytesPerRow: pngFile.width * 4 * BYTES_U8 },
    [pngFile.width, pngFile.height]
  );

  return texture;
};

function convertRGB_to_RGBA(data: Uint8Array) {
  const pxCnt = data.length / 3;
  const arr = new Uint8Array(pxCnt * 4);
  for (let x = 0; x < pxCnt; x++) {
    arr[4 * x] = data[3 * x];
    arr[4 * x + 1] = data[3 * x + 1];
    arr[4 * x + 2] = data[3 * x + 2];
    arr[4 * x + 3] = 255;
  }
  return arr;
}

/*
  // const b = new ImageData(a1.image as any, a1.width);
  // console.log(b);
  // const imageData = new Blob([await Deno.readFile(fp)], {
  // type: 'image/png',
  // });
  // imageBitmap = await createImageBitmap(imageData);

return createTextureWithData(
  device,
  {
    // format:
    // a1.colorType === png.ColorType.RGB ? 'rgb8unorm' : 'rgba8unorm-srgb',
    format: 'rgba8unorm-srgb',
    size: { width: a1.width, height: a1.height },
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  },
  arr
);
*/
