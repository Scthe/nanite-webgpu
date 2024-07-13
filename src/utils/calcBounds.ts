import { vec3, Vec3 } from 'wgpu-matrix';
import { CO_PER_VERTEX, VERTS_IN_TRIANGLE } from '../constants.ts';

export interface Bounds3d {
  sphere: BoundingSphere;
  box: BoundingBox;
}

export function calculateBounds(
  vertices: Float32Array,
  indices?: Uint32Array
): Bounds3d {
  const box = indices
    ? calcBoundingBoxIndex(vertices, indices)
    : calcBoundingBox(vertices);
  return { box, sphere: calcBoundingSphere(box) };
}

type BoundingBoxPoint = [number, number, number];
export type BoundingBox = [BoundingBoxPoint, BoundingBoxPoint];

type VertexCb = (v: [number, number, number]) => void;

function yieldVertices(
  vertices: Float32Array,
  stride = CO_PER_VERTEX,
  cb: VertexCb
) {
  const vertCount = vertices.length / stride;
  const v: [number, number, number] = [0, 0, 0];

  for (let i = 0; i < vertCount; i++) {
    const offset = i * stride;
    v[0] = vertices[offset];
    v[1] = vertices[offset + 1];
    v[2] = vertices[offset + 2];
    cb(v);
  }
}

function yieldVerticesIndex(
  vertices: Float32Array,
  indices: Uint32Array,
  cb: VertexCb
) {
  const v: [number, number, number] = [0, 0, 0];

  for (let i = 0; i < indices.length; i++) {
    const offset = indices[i] * VERTS_IN_TRIANGLE;
    v[0] = vertices[offset];
    v[1] = vertices[offset + 1];
    v[2] = vertices[offset + 2];
    cb(v);
  }
}

export function boundsCalculator(): [BoundingBox, VertexCb] {
  const maxCo: BoundingBoxPoint = [undefined!, undefined!, undefined!];
  const minCo: BoundingBoxPoint = [undefined!, undefined!, undefined!];
  const cb: VertexCb = (v) => {
    for (let co = 0; co < 3; co++) {
      maxCo[co] = maxCo[co] !== undefined ? Math.max(maxCo[co], v[co]) : v[co];
      minCo[co] = minCo[co] !== undefined ? Math.min(minCo[co], v[co]) : v[co];
    }
  };
  return [[minCo, maxCo], cb];
}

export function calcBoundingBox(
  vertices: Float32Array,
  stride = CO_PER_VERTEX
): BoundingBox {
  const [results, addVert] = boundsCalculator();
  yieldVertices(vertices, stride, addVert);
  return results;
}

export function calcBoundingBoxIndex(
  vertices: Float32Array,
  indices: Uint32Array
): BoundingBox {
  const [results, addVert] = boundsCalculator();
  yieldVerticesIndex(vertices, indices, addVert);
  return results;
}

export type BoundingSphere = { center: Vec3; radius: number };

export function isSameBoundingSphere(
  a: BoundingSphere | undefined,
  b: BoundingSphere | undefined
) {
  return (
    a?.center[0] === b?.center[0] &&
    a?.center[1] === b?.center[1] &&
    a?.center[2] === b?.center[2] &&
    a?.radius === b?.radius
  );
}

export function calcBoundingSphere([
  minCo,
  maxCo,
]: BoundingBox): BoundingSphere {
  const center = vec3.midpoint(minCo, maxCo);
  const radius = vec3.distance(center, maxCo);
  return { center, radius };
}

export function printBoundingBox(
  vertices: Float32Array,
  stride = CO_PER_VERTEX
) {
  const [minCo, maxCo] = calcBoundingBox(vertices, stride);
  const p = (a: number[]) => '[' + a.map((x) => x.toFixed(2)).join(',') + ']';
  console.log(`Bounding box min:`, p(minCo));
  console.log(`Bounding box max:`, p(maxCo));
}
