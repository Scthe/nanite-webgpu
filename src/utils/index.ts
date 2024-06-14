import { Mat4, mat4, vec3, vec4, Vec4, Vec3 } from 'wgpu-matrix';
import {
  BYTES_U32,
  CAMERA_CFG,
  CO_PER_VERTEX,
  VERTS_IN_TRIANGLE,
} from '../constants.ts';

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

export function getViewProjectionMatrix(viewMat: Mat4, projMat: Mat4): Mat4 {
  return mat4.multiply(projMat, viewMat);
}

export function getModelViewProjectionMatrix(
  modelMat: Mat4,
  viewMat: Mat4,
  projMat: Mat4
): Mat4 {
  const result = mat4.multiply(viewMat, modelMat);
  mat4.multiply(projMat, result, result);
  return result;
}

export function projectPoint(mvpMatrix: Mat4, p: Vec4 | Vec3) {
  const v = vec4.create(p[0], p[1], p[2], 1);
  return vec4.transformMat4(v, mvpMatrix, v);
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

function iterVertices(
  vertices: Float32Array,
  coPerVert = CO_PER_VERTEX,
  cb: (v: [number, number, number]) => void
) {
  const vertCount = vertices.length / coPerVert;
  const v: [number, number, number] = [0, 0, 0];

  for (let i = 0; i < vertCount; i++) {
    const offset = i * coPerVert;
    v[0] = vertices[offset];
    v[1] = vertices[offset + 1];
    v[2] = vertices[offset + 2];
    cb(v);
  }
}

export function calcBoundingBox(
  vertices: Float32Array,
  coPerVert = CO_PER_VERTEX
) {
  const maxCo = [vertices[0], vertices[1], vertices[2]];
  const minCo = [vertices[0], vertices[1], vertices[2]];
  iterVertices(vertices, coPerVert, (v) => {
    for (let co = 0; co < 3; co++) {
      maxCo[co] = Math.max(maxCo[co], v[co]);
      minCo[co] = Math.min(minCo[co], v[co]);
    }
  });
  return [minCo, maxCo];
}

export type BoundingSphere = { center: Vec3; radius: number };

export function calcBoundingSphere(
  vertices: Float32Array,
  coPerVert = CO_PER_VERTEX
): BoundingSphere {
  const [minCo, maxCo] = calcBoundingBox(vertices, coPerVert);
  const center = vec3.midpoint(minCo, maxCo);
  let r = 0;
  iterVertices(vertices, coPerVert, (v) => {
    r = Math.max(r, vec3.distance(v, center));
  });
  return { center, radius: r };
}

export function printBoundingBox(
  vertices: Float32Array,
  coPerVert = CO_PER_VERTEX
) {
  const [minCo, maxCo] = calcBoundingBox(vertices, coPerVert);
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

export const getBytesForTriangles = (triCnt: number) =>
  triCnt * VERTS_IN_TRIANGLE * BYTES_U32;

export function printMinMax(name: string, arr: TypedArray | number[]) {
  console.log(name, `min(${Math.min(...arr)})`, `max(${Math.max(...arr)})`);
}

export function pluckVertices(
  vertices: Float32Array,
  indices: Uint32Array
): Float32Array {
  const data: number[] = [];
  indices.forEach((idx) => {
    data.push(vertices[3 * idx]);
    data.push(vertices[3 * idx + 1]);
    data.push(vertices[3 * idx + 2]);
  });
  return new Float32Array(data);
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
