import { Mat4, mat4, vec4, Vec4, Vec3 } from 'wgpu-matrix';
import {
  BYTES_U32,
  CAMERA_CFG,
  CO_PER_VERTEX,
  VERTS_IN_TRIANGLE,
} from '../constants.ts';

import './wasm-types.d.ts';

export interface Dimensions {
  width: number;
  height: number;
}

export type ValueOf<T> = T[keyof T];

/** Remove readonly from object properties */
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };

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

export function getViewProjectionMatrix(
  viewMat: Mat4,
  projMat: Mat4,
  result?: Mat4
): Mat4 {
  return mat4.multiply(projMat, viewMat, result);
}

export function getModelViewProjectionMatrix(
  modelMat: Mat4,
  viewMat: Mat4,
  projMat: Mat4,
  result?: Mat4
): Mat4 {
  result = mat4.multiply(viewMat, modelMat, result);
  result = mat4.multiply(projMat, result, result);
  return result;
}

export function projectPoint(mvpMatrix: Mat4, p: Vec4 | Vec3, result?: Vec4) {
  let v: Vec4;
  if (p.length === 4) {
    if (p[3] !== 1) throw new Error(`Tried to project a point, but provided Vec4 has .w !== 1`); // prettier-ignore
    v = p;
  } else {
    v = vec4.create(p[0], p[1], p[2], 1);
  }
  return vec4.transformMat4(v, mvpMatrix, result);
}

/** debug matrix to string */
export function dbgMat(m: Float32Array | Mat4) {
  const s = Math.floor(Math.sqrt(m.length));
  let result = '';
  for (let i = 0; i < m.length; i++) {
    if (i % s === 0) result += '\n';
    else result += '   ';
    result += m[i].toFixed(2);
  }
  return `[${result}\n]`;
}

export function getClassName(a: object) {
  // deno-lint-ignore no-explicit-any
  return (a as any).constructor.name;
}

// deno-lint-ignore no-explicit-any
export function getTypeName(a: any) {
  if (Array.isArray(a)) return 'Array';
  if (typeof a === 'object') return getClassName(a);
  return typeof a;
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

export const getTriangleCount = (indices: Uint32Array | number) =>
  typeof indices === 'number'
    ? indices / VERTS_IN_TRIANGLE
    : indices.length / VERTS_IN_TRIANGLE;

export const getVertexCount = (verts: Float32Array | number[] | number) =>
  typeof verts === 'number'
    ? verts / CO_PER_VERTEX
    : verts.length / CO_PER_VERTEX;

export const getBytesForTriangles = (triCnt: number) =>
  triCnt * VERTS_IN_TRIANGLE * BYTES_U32;

export function printMinMax(name: string, arr: TypedArray | number[]) {
  console.log(name, `min(${Math.min(...arr)})`, `max(${Math.max(...arr)})`);
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes <= 0) return '0 Bytes';

  // prettier-ignore
  const units = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const v = (bytes / Math.pow(k, i)).toFixed(decimals);
  return `${v} ${units[i]}`;
}

export function formatNumber(num: number, decimals = 2) {
  if (num === 0) return '0';
  const sign = num < 0 ? '-' : '';
  num = Math.abs(num);

  const units = ['', 'k', 'm', 'b'];
  const k = 1000;
  const i = Math.floor(Math.log(num) / Math.log(k));
  const v = (num / Math.pow(k, i)).toFixed(decimals);
  return `${sign}${v}${units[i]}`;
}

/** Format 4 out of 100 into: '4 (4%)' */
export function formatPercentageNumber(actual: number, total: number) {
  const percent = total > 0 ? (actual / total) * 100.0 : 0;
  return `${actual} (${percent.toFixed(1)}%)`;
}

// deno-lint-ignore no-explicit-any
export function once(fn: (...arg1: any[]) => void) {
  let fired = false;
  // deno-lint-ignore no-explicit-any
  return (...arg1: any[]) => {
    if (fired) return;
    fired = true;
    fn(...arg1);
  };
}

export const isHtmlElVisible = (el: HTMLElement | null) => {
  return el && el.style.display !== 'none';
};

export const showHtmlEl = (
  el: HTMLElement | null,
  display: 'block' | 'flex' = 'block'
) => {
  if (el) el.style.display = display;
};

export const hideHtmlEl = (el: HTMLElement | null) => {
  if (el) el.style.display = 'none';
};

export const ensureHtmlElIsVisible = (
  el: HTMLElement | null,
  nextVisible: boolean
) => {
  const isVisible = isHtmlElVisible(el);
  if (isVisible === nextVisible) return;

  // console.log('HTML change visible to', nextVisible);
  if (nextVisible) {
    showHtmlEl(el);
  } else {
    hideHtmlEl(el);
  }
};

export const randomBetween = (start: number, end: number) => {
  return lerp(start, end, Math.random());
};

export function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

export function debounce<T extends unknown[]>(
  callback: (...args: T) => void,
  wait: number
) {
  let timer: number;

  return (...args: T): void => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
}

export const f32_to_u8 = (x: number) => Math.floor(x * 255);
export const u8_to_f32 = (x: number) => (x & 0xff) / 255.0;
