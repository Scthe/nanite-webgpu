import { Mat4 } from 'wgpu-matrix';
import {
  Dimensions,
  ensureTypedArray,
  getClassName,
  getTypeName,
} from './index.ts';
import { CONFIG, IS_WGPU } from '../constants.ts';

export const WEBGPU_MINIMAL_BUFFER_SIZE = 256;

export async function createGpuDevice() {
  try {
    const adapter = await navigator.gpu.requestAdapter({
      powerPreference: 'high-performance',
    });
    const onError = (msg: string) =>
      console.error(`WebGPU init error: '${msg}'`);

    if (!adapter) {
      // On web: check if https. On ff, WebGPU is under dev flag.
      onError('No adapter found. WebGPU seems to be unavailable.');
      return;
    }

    const canTimestamp = adapter.features.has('timestamp-query');
    const requiredFeatures: GPUFeatureName[] = ['float32-filterable'];
    if (canTimestamp) {
      requiredFeatures.push('timestamp-query');
    }

    const device = await adapter?.requestDevice({ requiredFeatures });
    if (!device) {
      onError('Failed to get GPUDevice from the adapter.');
      return;
    }

    return device;
  } catch (e) {
    console.error(e);
    return;
  }
}

export const GPU_BUFFER_USAGE_UNIFORM: GPUBufferUsageFlags =
  GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST;

export function createGPUBuffer<T extends TypedArray>(
  device: GPUDevice,
  label: string,
  usage: GPUBufferUsageFlags,
  data: T
) {
  const gpuBuffer = device.createBuffer({
    label,
    size: data.byteLength,
    usage,
  });
  /*console.log(`create buffer [${label}]`, {
    dataLen: data.length,
    dataBytes: data.byteLength,
    gpuSize: gpuBuffer.size,
    data,
  });*/
  device.queue.writeBuffer(gpuBuffer, 0, data);
  return gpuBuffer;
}

export function createGPU_VertexBuffer(
  device: GPUDevice,
  label: string,
  data: Float32Array | number[],
  extraUsage: GPUBufferUsage = 0
) {
  const dataTypedArr = ensureTypedArray(Float32Array, data);
  return createGPUBuffer(
    device,
    label,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST | (extraUsage as number),
    dataTypedArr
  );
}

export function createGPU_IndexBuffer(
  device: GPUDevice,
  label: string,
  data: Uint32Array | number[]
) {
  const dataTypedArr = ensureTypedArray(Uint32Array, data);
  return createGPUBuffer(
    device,
    label,
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    dataTypedArr
  );
}

export function createGPU_StorageBuffer(
  device: GPUDevice,
  label: string,
  data: Uint32Array | Float32Array
) {
  const clName = getClassName(data);
  if (clName !== Uint32Array.name && clName !== Float32Array.name) {
    throw new Error(`Invalid data provided to createGPU_StorageBuffer(). Expected TypedArray, got ${clName}`) // prettier-ignore
  }

  return createGPUBuffer(
    device,
    label,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    data
  );
}

export function writeMatrixToGPUBuffer(
  device: GPUDevice,
  gpuBuffer: GPUBuffer,
  offsetBytes: number,
  data: Mat4
) {
  // deno-lint-ignore no-explicit-any
  const f32Arr: Float32Array = data as any;
  device.queue.writeBuffer(gpuBuffer, offsetBytes, f32Arr.buffer, 0);
}

/** https://github.com/Scthe/nanite-webgpu/issues/2 */
export function cmdClearWholeBuffer(cmdBuf: GPUCommandEncoder, buf: GPUBuffer) {
  if (IS_WGPU) {
    // wgpu requires "offset, size", even though both are optional
    // https://www.w3.org/TR/webgpu/#dom-gpucommandencoder-clearbuffer
    cmdBuf.clearBuffer(buf, 0, buf.size);
  } else {
    cmdBuf.clearBuffer(buf);
  }
}

export const getItemsPerThread = (items: number, threads: number) =>
  Math.ceil(items / threads);

///////////////
/// Readback GPU->CPU

export function createReadbackBuffer(device: GPUDevice, orgBuffer: GPUBuffer) {
  return device.createBuffer({
    label: `${orgBuffer}-readback-buffer`,
    size: orgBuffer.size,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });
}

export function cmdCopyToReadbackBuffer(
  cmdBuf: GPUCommandEncoder,
  orgBuffer: GPUBuffer,
  readbackBuffer: GPUBuffer
) {
  cmdBuf.copyBufferToBuffer(orgBuffer, 0, readbackBuffer, 0, orgBuffer.size);
}

export async function readBufferToCPU<T>(
  TypedArrayClass: { new (a: ArrayBuffer): T },
  buffer: GPUBuffer
): Promise<T> {
  await buffer.mapAsync(GPUMapMode.READ);
  const arrayBufferData = buffer.getMappedRange();
  // use slice() to copy. The 'arrayBufferData' might be deallocated after unmap (chrome)
  const resultData = new TypedArrayClass(arrayBufferData.slice(0));
  buffer.unmap();
  return resultData;
}

export async function downloadBuffer<T>(
  device: GPUDevice,
  TypedArrayClass: { new (a: ArrayBuffer): T },
  orgBuffer: GPUBuffer
) {
  if (!CONFIG.isTest) {
    console.warn(`Reading '${orgBuffer.label}' buffer back to CPU. This is slow!`); // prettier-ignore
  }

  let readbackBuffer: GPUBuffer | undefined = undefined;
  try {
    readbackBuffer = createReadbackBuffer(device, orgBuffer);

    // copy using command
    const cmdBuf = device.createCommandEncoder({
      label: `${orgBuffer.label}-readback`,
    });
    cmdCopyToReadbackBuffer(cmdBuf, orgBuffer, readbackBuffer);
    device.queue.submit([cmdBuf.finish()]);

    // Warning: try-catch with promises
    const result = await readBufferToCPU(TypedArrayClass, readbackBuffer);

    return result;
  } catch (e) {
    throw e;
  } finally {
    if (readbackBuffer) {
      // readbackBuffer.unmap(); // already unmapped by readBufferToCPU()
      readbackBuffer.destroy();
    }
  }
}

///////////////
/// Texture -> Buffer readback

/** When reading data from texture to buffer, we need to provide alignments */
export function getPaddedBytesPerRow(width: number, bytesPerPixel: number) {
  const unpaddedBytesPerRow = width * bytesPerPixel;
  const align = 256; // COPY_BYTES_PER_ROW_ALIGNMENT
  const paddedBytesPerRowPadding =
    (align - (unpaddedBytesPerRow % align)) % align;
  return unpaddedBytesPerRow + paddedBytesPerRowPadding;
}

/** https://github.com/chirsz-ever/deno/blob/2cf21a4aea99ed8cb7530e43c8d68b9c4a84ea3e/tests/unit/webgpu_test.ts#L182 */
export function createReadbackBufferFromTexture(
  device: GPUDevice,
  dims: Dimensions,
  bytesPerPixel: number
) {
  const paddedBytesPerRow = getPaddedBytesPerRow(dims.width, bytesPerPixel);
  return device.createBuffer({
    label: 'test-readback',
    size: dims.height * paddedBytesPerRow,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
}

export function cmdCopyTextureToBuffer(
  cmdBuf: GPUCommandEncoder,
  texture: GPUTexture,
  bytesPerPixel: number,
  buffer: GPUBuffer,
  mipLevel?: {
    miplevel: number;
    width: number;
    height: number;
  }
) {
  const width = mipLevel?.width || texture.width;
  const height = mipLevel?.height || texture.height;

  const paddedBytesPerRow = getPaddedBytesPerRow(width, bytesPerPixel);
  cmdBuf.copyTextureToBuffer(
    { texture, mipLevel: mipLevel?.miplevel },
    {
      buffer,
      bytesPerRow: paddedBytesPerRow,
      rowsPerImage: height,
    },
    { width, height }
  );
}

///////////////
/// Utils

// deno-lint-ignore no-explicit-any
export const isGPUTextureView = (maybeTexView: any) =>
  typeof maybeTexView === 'object' &&
  getClassName(maybeTexView) === GPUTextureView.name;

/** TS typings do not see difference between GPUTexture and GPUTextureView */
// deno-lint-ignore no-explicit-any
export const assertIsGPUTextureView = (maybeTexView: any) => {
  if (!isGPUTextureView(maybeTexView)) {
    throw new Error(
      `Expected ${GPUTextureView.name}, got ${getTypeName(maybeTexView)}`
    );
  }
};

/** https://github.com/Scthe/nanite-webgpu/issues/2 */
export function ensureIntegerDimensions(dims: Dimensions): Dimensions {
  return {
    width: Math.ceil(dims.width),
    height: Math.ceil(dims.height),
  };
}
