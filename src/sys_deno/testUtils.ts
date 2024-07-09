import * as path from 'std-path';
import { assertEquals } from 'assert';
import {
  Dimensions,
  Writeable,
  createCameraProjectionMat,
  getClassName,
  getModelViewProjectionMatrix,
} from '../utils/index.ts';
import { createGpuDevice, getPaddedBytesPerRow } from '../utils/webgpu.ts';
import { createErrorSystem, rethrowWebGPUError } from '../utils/errors.ts';
import { PassCtx } from '../passes/passCtx.ts';
import { Camera } from '../camera.ts';
import { mat4 } from 'wgpu-matrix';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { BYTES_F32, CONFIG } from '../constants.ts';
import { Frustum } from '../utils/frustum.ts';
import { OVERRIDE_MESHOPTIMIZER_WASM_PATH } from '../meshPreprocessing/meshoptimizerUtils.ts';
import { OVERRIDE_METIS_WASM_PATH } from '../meshPreprocessing/partitionGraph.ts';
import { createDepthPyramidSampler } from '../passes/depthPyramid/depthPyramidPass.ts';
import { existsSync } from 'fs';
import { NaniteObjectBuffers } from '../scene/naniteBuffers/index.ts';

export function absPathFromRepoRoot(filePath: string) {
  const __dirname = path.dirname(path.fromFileUrl(import.meta.url));
  return path.resolve(__dirname, '..', '..', filePath);
}

export function relativePath(
  importMeta: { dirname?: string },
  filePath: string
) {
  return path.resolve(importMeta?.dirname || '', filePath);
}

export function injectMeshoptimizerWASM() {
  OVERRIDE_MESHOPTIMIZER_WASM_PATH.value =
    'file:///' + absPathFromRepoRoot('static/meshoptimizer.wasm');
}

export function injectMetisWASM() {
  OVERRIDE_METIS_WASM_PATH.value =
    'file:///' + absPathFromRepoRoot('static/metis.wasm');
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
  const depthPyramidSampler = createDepthPyramidSampler(device);

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
    hdrRenderTexture: undefined!,
    softwareRasterizerEnabled: false,
    rasterizerSwResult: undefined!,
    globalUniforms: undefined!,
    prevFrameDepthPyramidTexture: dummyPyramidTexture.createView(),
    cameraFrustum,
    depthPyramidSampler,
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
  const MOCK_PARENT_BOUNDS = { center, radius: 1 };
  const MOCK_SIBLINGS_BOUNDS = { center, radius: 1 };

  const meshlets = data.map(
    ({ parentIdx, ...m }, idx): MeshletWIP => ({
      id: idx,
      maxSiblingsError: 0.001,
      parentError: parentIdx !== undefined ? 0.002 : Infinity,
      sharedSiblingsBounds: MOCK_SIBLINGS_BOUNDS,
      parentBounds: parentIdx !== undefined ? MOCK_PARENT_BOUNDS : undefined,
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

export async function assertBinarySnapshot(
  filepath: string,
  bytes: ArrayBuffer
) {
  const bytesU8 = new Uint8Array(bytes);

  if (existsSync(filepath)) {
    console.log(`Comparing snapshots: '${filepath}'`);
    const expected = await Deno.readFile(filepath);
    // expected[0] = 11; // test that it fails
    assertEquals(
      bytesU8,
      expected,
      'Uint8Array result does not match snapshot',
      {
        formatter: () => '<buffers-too-long-to-print>',
      }
    );
  } else {
    console.log(`Creating new snapshot: '${filepath}'`);
    await Deno.writeFile(filepath, bytesU8);
  }
}

export function mockNaniteObjectBuffers(): Writeable<NaniteObjectBuffers> {
  // deno-lint-ignore no-explicit-any
  return new (NaniteObjectBuffers as any)();
}
