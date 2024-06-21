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
import { BYTES_F32, CONFIG } from '../constants.ts';
import { Frustum } from '../utils/frustum.ts';

export function absPathFromRepoRoot(filePath: string) {
  const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
  return path.resolve(__dirname, '..', '..', filePath);
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
  const dummyPyramidTexture = device.createTexture({
    label: 'dummy-pyramid-texture',
    dimension: '2d',
    size: [viewport.width, viewport.height, 1],
    format: 'r8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });

  const cameraCtrl = new Camera();
  const projMatrix = createCameraProjectionMat(viewport);
  const vpMatrix = getModelViewProjectionMatrix(
    mat4.identity(),
    cameraCtrl.viewMatrix,
    projMatrix
  );
  const cameraFrustum = new Frustum();
  cameraFrustum.update(vpMatrix);

  return {
    frameIdx: 0,
    device,
    cmdBuf,
    vpMatrix,
    viewMatrix: cameraCtrl.viewMatrix,
    projMatrix,
    cameraPositionWorldSpace: cameraCtrl.positionWorldSpace,
    profiler: undefined,
    viewport,
    scene: undefined!,
    depthTexture: undefined!,
    screenTexture: undefined!,
    globalUniforms: undefined!,
    prevFrameDepthPyramidTexture: dummyPyramidTexture.createView(),
    cameraFrustum,
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
  actual.forEach((e) => actualAsArr.push(e)); // Uint32Array | Float32Array -> number[]
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

/** When reading data from texture to buffer, we need to provide alignments */
export function getPaddedBytesPerRow(width: number, bytesPerPixel: number) {
  const unpaddedBytesPerRow = width * bytesPerPixel;
  const align = 256; // COPY_BYTES_PER_ROW_ALIGNMENT
  const paddedBytesPerRowPadding =
    (align - (unpaddedBytesPerRow % align)) % align;
  return unpaddedBytesPerRow + paddedBytesPerRowPadding;
}

/** https://github.com/chirsz-ever/deno/blob/2cf21a4aea99ed8cb7530e43c8d68b9c4a84ea3e/tests/unit/webgpu_test.ts#L182 */
export function createTextureReadbackBuffer(
  device: GPUDevice,
  dims: {
    width: number;
    height: number;
    bytesPerPixel: number;
  }
) {
  const paddedBytesPerRow = getPaddedBytesPerRow(
    dims.width,
    dims.bytesPerPixel
  );
  return device.createBuffer({
    label: 'test-readback',
    size: dims.height * paddedBytesPerRow,
    usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
  });
}

/** https://github.com/chirsz-ever/deno/blob/2cf21a4aea99ed8cb7530e43c8d68b9c4a84ea3e/tests/unit/webgpu_test.ts#L182 */
export function createTextureReadbackBuffer2(
  device: GPUDevice,
  texture: GPUTexture,
  bytesPerPixel: number
) {
  return createTextureReadbackBuffer(device, {
    width: texture.width,
    height: texture.height,
    bytesPerPixel,
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

export function parseTextureBufferF32(
  width: number,
  height: number,
  resultData: Float32Array
): number[][] {
  const result: number[][] = [];
  const paddedBytesPerRow = getPaddedBytesPerRow(width, BYTES_F32);

  for (let row = 0; row < width; row++) {
    const offset = (paddedBytesPerRow * row) / BYTES_F32;
    // let s = '';
    const rowData: number[] = [];
    result.push(rowData);
    for (let col = 0; col < height; col++) {
      const valAsF32 = resultData[offset + col];
      const valAsU8 = Math.floor(valAsF32 * 256);
      // console.log(`[${x},${y}]`, );
      // s += Math.floor(valAsF32 * 256) + '   ';
      rowData.push(valAsU8);
    }
    // console.log(s);
  }

  return result;
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
      sharedSiblingsBounds: { center, radius: 1 },
      parentBounds: { center, radius: 1 },
      // ignore fields below:
      boundaryEdges: [],
      createdFrom: [],
      indices: new Uint32Array([0, 1, 2]),
      lodLevel: 0,
      // deno-lint-ignore no-explicit-any
      ownBounds: {} as any,
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
