import { Mat4, mat4 } from 'wgpu-matrix';
import { CAMERA_CFG, CO_PER_VERTEX, VERTS_IN_TRIANGLE } from '../constants.ts';

export * from './errors.ts';
export * from './webgpu.ts';

export interface Dimensions {
  width: number;
  height: number;
}

export type ValueOf<T> = T[keyof T];

export const dgr2rad = (dgr: number) => (dgr * Math.PI) / 180;

export function createCameraProjectionMat(viewportSize: Dimensions): Mat4 {
  const aspectRatio = viewportSize.width / viewportSize.height;

  return mat4.perspective(
    dgr2rad(CAMERA_CFG.fovDgr),
    aspectRatio,
    CAMERA_CFG.near,
    CAMERA_CFG.far
  );
}

export function getModelViewProjectionMatrix(
  viewMat: Mat4,
  projMat: Mat4
): Mat4 {
  return mat4.multiply(projMat, viewMat);
}

export function getClassName(a: object) {
  // deno-lint-ignore no-explicit-any
  return (a as any).constructor.name;
}

export const createArray = (len: number) => Array(len).fill(0);

type TypedArrayConstructor<T extends TypedArray> = new (len: number) => T;

export function copyToTypedArray<T extends TypedArray>(
  TypedArrayClass: TypedArrayConstructor<T>,
  data: number[]
): T {
  const result = new TypedArrayClass(data.length);
  data.forEach((e, idx) => (result[idx] = e));
  return result;
}

export function ensureTypedArray<T extends TypedArray>(
  TypedArrayClass: TypedArrayConstructor<T>,
  data: T | number[]
): T {
  if (data instanceof TypedArrayClass) {
    return data;
  } else {
    // deno-lint-ignore no-explicit-any
    return copyToTypedArray(TypedArrayClass, data as any);
  }
}

export const lerp = (a: number, b: number, fac: number) => {
  fac = Math.max(0, Math.min(1, fac));
  return a * (1 - fac) + b * fac;
};

export function printBoundingBox(
  vertices: Float32Array,
  coPerVert = CO_PER_VERTEX
) {
  const maxCo = [vertices[0], vertices[1], vertices[2]];
  const minCo = [vertices[0], vertices[1], vertices[2]];
  const vertCount = vertices.length / coPerVert;

  for (let i = 0; i < vertCount; i++) {
    const offset = i * coPerVert;
    for (let co = 0; co < 3; co++) {
      maxCo[co] = Math.max(maxCo[co], vertices[offset + co]);
      minCo[co] = Math.min(minCo[co], vertices[offset + co]);
    }
  }

  const p = (a: number[]) => '[' + a.map((x) => x.toFixed(2)).join(',') + ']';
  console.log(`Bounding box min:`, p(minCo));
  console.log(`Bounding box max:`, p(maxCo));
}

export const getTriangleCount = (indices: Uint32Array | number) =>
  typeof indices === 'number'
    ? indices / VERTS_IN_TRIANGLE
    : indices.length / VERTS_IN_TRIANGLE;

export const getVertexCount = (verts: Float32Array | number) =>
  typeof verts === 'number'
    ? verts / CO_PER_VERTEX
    : verts.length / CO_PER_VERTEX;

export function printMinMax(name: string, arr: TypedArray | number[]) {
  console.log(name, `min(${Math.min(...arr)})`, `max(${Math.max(...arr)})`);
}
