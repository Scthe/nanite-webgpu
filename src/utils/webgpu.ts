import { Mat4 } from 'wgpu-matrix';
import { ensureTypedArray } from './index.ts';
import { BYTES_U32, CONFIG } from '../constants.ts';

export const WEBGPU_MINIMAL_BUFFER_SIZE = 256;

export const BYTES_DRAW_INDIRECT = Math.max(
  WEBGPU_MINIMAL_BUFFER_SIZE,
  4 * BYTES_U32
);

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
    const requiredFeatures: GPUFeatureName[] = [];
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
  data: Float32Array | number[]
) {
  const dataTypedArr = ensureTypedArray(Float32Array, data);
  return createGPUBuffer(
    device,
    label,
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
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

export function assertHasInjectedShader(clazz: {
  SHADER_CODE: string;
  name: string;
}) {
  if (!clazz.SHADER_CODE || clazz.SHADER_CODE.length == 0) {
    throw new Error(`${clazz.name} has no .SHADER_CODE defined.`);
  }
}

type ShaderOverrides = { [key: string]: string };

/**
 * In WGSL there is something called overrides:
 *  - https://www.w3.org/TR/WGSL/#override-declaration
 *  - https://webgpufundamentals.org/webgpu/lessons/webgpu-constants.html
 * Would have been better than text replace. But neither works
 * with language servers in text editors, so might as well text replace.
 */
export function applyShaderTextReplace(
  text: string,
  overrides?: ShaderOverrides
) {
  let code = text;
  overrides = overrides || {};
  Object.entries(overrides).forEach(([k, v]) => {
    code = code.replaceAll(k, v);
  });
  return code;
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

export function cmdCopyToReadBackBuffer(
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
  // slice to copy. The 'arrayBufferData' might be deallocated after unmap (chrome)
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
    cmdCopyToReadBackBuffer(cmdBuf, orgBuffer, readbackBuffer);
    device.queue.submit([cmdBuf.finish()]);

    // Warning: try-catch with promises
    const result = await readBufferToCPU(TypedArrayClass, readbackBuffer);

    return result;
  } catch (e) {
    throw e;
  } finally {
    if (readbackBuffer) {
      readbackBuffer.unmap();
      readbackBuffer.destroy();
    }
  }
}
