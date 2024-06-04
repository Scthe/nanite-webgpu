import { Mat4 } from 'wgpu-matrix';

export type TypedArray = Float32Array | Uint8Array | Uint32Array;

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
