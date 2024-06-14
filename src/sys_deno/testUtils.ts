import * as path from 'std-path';
import { assertEquals } from 'assert';
import {
  Dimensions,
  createCameraProjectionMat,
  getClassName,
  getModelViewProjectionMatrix,
} from '../utils/index.ts';
import { createGpuDevice } from '../utils/webgpu.ts';
import { createErrorSystem, rethrowWebGPUError } from '../utils/errors.ts';
import { PassCtx } from '../passes/passCtx.ts';
import { Camera } from '../camera.ts';
import { mat4 } from 'wgpu-matrix';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { CONFIG } from '../constants.ts';

export function absPathFromRepoRoot(filePath: string) {
  const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
  return path.resolve(__dirname, '..', '..', filePath);
}

export function injectDenoShader(
  PassClass: { SHADER_CODE: string },
  modulePath: string, // import.meta.url
  shaderFile: string
) {
  const __dirname = path.dirname(path.fromFileUrl(modulePath));
  PassClass.SHADER_CODE = Deno.readTextFileSync(
    `${__dirname}${path.SEPARATOR}${shaderFile}`
  );
}

type ValidateWebGPUCallsFn = () => Promise<void>;

export async function createGpuDevice_TESTS(): Promise<
  [GPUDevice, ValidateWebGPUCallsFn]
> {
  const device = await createGpuDevice();
  if (!device) throw new Error('No webgpu device');

  const errorSystem = createErrorSystem(device);
  errorSystem.startErrorScope();
  const validateFn = async () => {
    await errorSystem.reportErrorScopeAsync(rethrowWebGPUError);
  };

  CONFIG.isTest = true;
  return [device, validateFn];
}

export const createMockPassCtx = (
  device: GPUDevice,
  cmdBuf: GPUCommandEncoder
): PassCtx => {
  const viewport: Dimensions = {
    width: 800,
    height: 600,
  };

  const cameraCtrl = new Camera();
  const projMatrix = createCameraProjectionMat(viewport);
  const vpMatrix = getModelViewProjectionMatrix(
    mat4.identity(),
    cameraCtrl.viewMatrix,
    projMatrix
  );

  return {
    device,
    cmdBuf,
    vpMatrix,
    viewMatrix: cameraCtrl.viewMatrix,
    projMatrix,
    profiler: undefined,
    viewport,
    scene: undefined!,
    depthTexture: undefined!,
    screenTexture: undefined!,
  };
};

export const assertSameArray = (
  actual: number[] | Uint32Array | Float32Array,
  expected: number[]
) => {
  assertEquals(
    actual.length,
    expected.length,
    `Different array length: ${actual.length} vs ${expected.length}`
  );
  const actualAsArr: number[] = [];
  actual.forEach((e) => actualAsArr.push(e));
  assertEquals(actualAsArr, expected);
};

export function printTypedArray(
  preffix: string,
  arr: Float32Array | Uint32Array,
  cnt = 0
) {
  cnt = cnt > 0 ? cnt : arr.length;
  const data = Array.from(arr).slice(0, cnt);
  const typeName = getClassName(arr);
  preffix = preffix.length > 0 ? `${preffix} ` : '';
  console.log(
    `${preffix}${typeName}(len=${arr.length}, bytes=${arr.byteLength})`,
    data
  );
}

///////////////
/// Readback GPU->CPU

export function createReadbackBuffer(device: GPUDevice, orgBuffer: GPUBuffer) {
  return device.createBuffer({
    label: 'test-readback',
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
  await buffer.mapAsync(1);
  const arrayBufferData = buffer.getMappedRange();
  const resultData = new TypedArrayClass(arrayBufferData);
  buffer.unmap();
  return resultData;
}

///////////////
/// Create mock data
/*
export function createIndicesU32Array(cnt: number, shuffle = false) {
  const arr = createArray(cnt).map((_, idx) => idx);

  if (shuffle) {
    shuffleArray(arr);
  }

  return copyToTypedArray(Uint32Array, arr);
}

export function createRandomF32Array(cnt: number) {
  const result = new Float32Array(cnt);
  for (let i = 0; i < cnt; i++) {
    result[i] = Math.random();
  }
  return result;
}

export function createRandomVec4Array(cnt: number, w = 1) {
  const rngCoord = () => Math.random() * 2 - 1;
  const result = new Float32Array(cnt * 4);
  for (let i = 0; i < cnt; i++) {
    result[i * 4] = rngCoord();
    result[i * 4 + 1] = rngCoord();
    result[i * 4 + 2] = rngCoord();
    result[i * 4 + 3] = w;
  }
  return result;
}

function shuffleArray(array: number[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
*/

/** Replace MeshletWIP's 'createdFrom' with indices*/
type PartialMeshletWIP = Partial<Omit<MeshletWIP, 'createdFrom'>> & {
  parentIdx?: number;
};

export function createMeshlets_TESTS(
  data: Array<PartialMeshletWIP>
): MeshletWIP[] {
  const center = [0, 0, -1.2];
  const meshlets = data.map(
    // deno-lint-ignore no-unused-vars
    ({ parentIdx, ...m }, idx): MeshletWIP => ({
      id: idx,
      maxSiblingsError: 0.001,
      parentError: 0.002,
      bounds: { center, radius: 1 },
      parentBounds: { center, radius: 1 },
      // ignore fields below:
      boundaryEdges: [],
      createdFrom: [],
      indices: new Uint32Array([0, 1, 2]),
      lodLevel: 0,
      ...m,
    })
  );
  data.forEach((m, idx) => {
    if (m.parentIdx !== undefined) {
      meshlets[m.parentIdx].createdFrom.push(meshlets[idx]);
    }
  });
  return meshlets;
}
