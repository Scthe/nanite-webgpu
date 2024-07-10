export type TextFileReader = (filename: string) => Promise<string>;

export type TextureReader = (
  device: GPUDevice,
  path: string,
  format: GPUTextureFormat,
  usage: GPUTextureUsageFlags
) => Promise<GPUTexture>;

/** Progress [0..1] or status */
export type ObjectLoadingProgressCb = (
  name: string,
  msg: number | string
) => Promise<void>;
