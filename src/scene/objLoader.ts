import * as objLoader from 'webgl-obj-loader';
import { copyToTypedArray, createArray } from '../utils/index.ts';
import { vec3 } from 'wgpu-matrix';

const Mesh = objLoader.default?.Mesh || objLoader.Mesh; // deno vs chrome

interface ObjMesh {
  indices: number[];
  vertices: number[];
  vertexNormals?: Array<number | typeof NaN>;
  textures?: Array<number | typeof NaN>;
}
const vertexCount = (mesh: ObjMesh) => Math.ceil(mesh.vertices.length / 3);

export interface ParsedMesh {
  vertices: Float32Array;
  normals: Float32Array;
  uv: Float32Array;
  indices: Uint32Array;
}

// deno-lint-ignore require-await
export async function loadObjFile(
  objText: string,
  scale: number
): Promise<ParsedMesh> {
  const mesh: ObjMesh = new Mesh(objText);
  // const { vertices, indices } = mesh;
  fillMissingData(mesh);
  // console.log(mesh);

  const vertexF32 = copyToTypedArray(
    Float32Array,
    mesh.vertices.map((e: number) => e * scale)
  );
  const uvF32 = copyToTypedArray(Float32Array, mesh.textures!);
  const normalsF32 = copyToTypedArray(Float32Array, mesh.vertexNormals!);
  const indexU32 = copyToTypedArray(Uint32Array, mesh.indices);

  // TODO restore buffers optimization?
  // TIP: use makeBufferData() to fold into a single buffer
  // const [optVertices, optIndices] = await optimizeMeshBuffers(
  // vertexF32,
  // indexU32
  // );
  // return [optVertices, optIndices];
  return {
    vertices: vertexF32,
    normals: normalsF32,
    uv: uvF32,
    indices: indexU32,
  };
}

const hasNormals = (mesh: ObjMesh) => {
  if (!mesh.vertexNormals || !Array.isArray(mesh.vertexNormals)) return false;
  const firstEl = mesh.vertexNormals[0];
  return typeof firstEl === 'number' && !isNaN(firstEl);
};

const hasUVs = (mesh: ObjMesh) => {
  if (!mesh.textures || !Array.isArray(mesh.textures)) return false;
  const firstEl = mesh.textures[0];
  return typeof firstEl === 'number' && !isNaN(firstEl);
};

function fillMissingData(mesh: ObjMesh) {
  if (!hasNormals(mesh)) {
    recalcNormals(mesh);
  }

  if (!hasUVs(mesh)) {
    const vertCnt = vertexCount(mesh);
    mesh.textures = createArray(vertCnt * 2).fill(0.5);
  }
}

/** https://github.com/zeux/meshoptimizer/blob/f13503c8f1196e20bcfb1e67ea1e97b1d0ce98c7/demo/main.cpp#L145 */
function recalcNormals(mesh: ObjMesh) {
  const vertCnt = vertexCount(mesh);
  mesh.vertexNormals = createArray(vertCnt * 3).fill(0.0);

  const x = (idx: number) => mesh.vertices[3 * idx];
  const y = (idx: number) => mesh.vertices[3 * idx + 1];
  const z = (idx: number) => mesh.vertices[3 * idx + 2];

  // accumulate triangle normals for each vert
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const a = mesh.indices[i];
    const b = mesh.indices[i + 1];
    const c = mesh.indices[i + 2];

    const nx = (y(b) - y(a)) * (z(c) - z(a)) - (z(b) - z(a)) * (y(c) - y(a));
    const ny = (z(b) - z(a)) * (x(c) - x(a)) - (x(b) - x(a)) * (z(c) - z(a));
    const nz = (x(b) - x(a)) * (y(c) - y(a)) - (y(b) - y(a)) * (x(c) - x(a));

    for (let k = 0; k < 3; ++k) {
      const index = mesh.indices[i + k];
      mesh.vertexNormals[index * 3 + 0] += nx;
      mesh.vertexNormals[index * 3 + 1] += ny;
      mesh.vertexNormals[index * 3 + 2] += nz;
    }
  }

  // average/normalize accumulated normals
  let tmp = vec3.create();
  for (let i = 0; i < vertCnt; i++) {
    const n = vec3.set(
      mesh.vertexNormals[i * 3 + 0],
      mesh.vertexNormals[i * 3 + 1],
      mesh.vertexNormals[i * 3 + 2],
      tmp
    );
    tmp = vec3.normalize(n, tmp);
    mesh.vertexNormals[i * 3 + 0] = tmp[0];
    mesh.vertexNormals[i * 3 + 1] = tmp[1];
    mesh.vertexNormals[i * 3 + 2] = tmp[2];
  }
}
