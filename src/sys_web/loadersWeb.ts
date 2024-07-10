import { TextFileReader, TextureReader } from '../scene/load/types.ts';

export const textFileReader_Web: TextFileReader = async (filename: string) => {
  const objFileResp = await fetch(filename);
  if (!objFileResp.ok) {
    throw `Could not download mesh file '${filename}'`;
  }
  return objFileResp.text();
};

/** https://webgpu.github.io/webgpu-samples/?sample=texturedCube#main.ts */
export const createTextureFromFile_Web: TextureReader = async (
  device: GPUDevice,
  path: string,
  format: GPUTextureFormat,
  usage: GPUTextureUsageFlags
) => {
  const response = await fetch(path);
  const imageBitmap = await createImageBitmap(await response.blob());

  const texture = device.createTexture({
    label: path,
    dimension: '2d',
    size: [imageBitmap.width, imageBitmap.height, 1],
    format,
    usage,
  });
  // deno-lint-ignore no-explicit-any
  (device.queue as any).copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: texture },
    [imageBitmap.width, imageBitmap.height]
  );

  return texture;
};
