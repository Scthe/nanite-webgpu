import * as objLoader from 'webgl-obj-loader';
import {
  copyToTypedArray,
  createArray,
  getVertexCount,
} from '../utils/index.ts';
import { vec3 } from 'wgpu-matrix';
import { optimizeMeshBuffers } from '../meshPreprocessing/optimizeMeshBuffers.ts';
import { BYTES_F32, BYTES_VEC3 } from '../constants.ts';
import { Bounds3d, calculateBounds } from '../utils/calcBounds.ts';

const Mesh = objLoader.default?.Mesh || objLoader.Mesh; // deno vs chrome
const Layout = objLoader.default?.Layout || objLoader.Layout; // deno vs chrome

interface ObjMesh {
  indices: number[];
  vertices: number[];
  vertexNormals?: Array<number | typeof NaN>;
  textures?: Array<number | typeof NaN>;
}
const vertexCount = (mesh: ObjMesh) => Math.ceil(mesh.vertices.length / 3);

export interface ParsedMesh {
  vertexCount: number;
  positions: Float32Array;
  positionsStride: number; // in bytes
  normals: Float32Array;
  uv: Float32Array;
  verticesAndAttributes: Float32Array;
  verticesAndAttributesStride: number; // in bytes
  indices: Uint32Array;
  indicesCount: number;
  bounds: Bounds3d;
}

export async function loadObjFile(
  objText: string,
  scale: number
): Promise<ParsedMesh> {
  const mesh = new Mesh(objText) as ObjMesh;
  cleanupRawOBJData(mesh, scale);
  // console.log(mesh);

  const vertexCountInitial = getVertexCount(mesh.vertices);
  const indicesInitial = copyToTypedArray(Uint32Array, mesh.indices);

  // create a single buffer that containst ALL vertex attributes
  const layout = new Layout(Layout.POSITION, Layout.NORMAL, Layout.UV);
  // deno-lint-ignore no-explicit-any
  const verticesAndAttributesU8 = (mesh as any).makeBufferData(layout);
  const verticesAndAttributes = new Float32Array(verticesAndAttributesU8);

  // optimize vertex and index buffer
  const strideBytes = layout.stride; // 32
  const strideF32 = strideBytes / BYTES_F32; // 8
  const [verticesNew, indicesNew] = await optimizeMeshBuffers(
    verticesAndAttributes,
    vertexCountInitial,
    strideBytes,
    indicesInitial
  );

  // split optimized vertex buffer into per-attribute copies
  const newVertexCount = verticesNew.length / strideF32;
  const positionsF32 = new Float32Array(newVertexCount * 3);
  const normalsF32 = new Float32Array(newVertexCount * 3);
  const uvF32 = new Float32Array(newVertexCount * 2);
  for (let vertIdx = 0; vertIdx < newVertexCount; vertIdx++) {
    const offset = vertIdx * strideF32;
    positionsF32[3 * vertIdx + 0] = verticesNew[offset + 0];
    positionsF32[3 * vertIdx + 1] = verticesNew[offset + 1];
    positionsF32[3 * vertIdx + 2] = verticesNew[offset + 2];
    normalsF32[3 * vertIdx + 0] = verticesNew[offset + 3];
    normalsF32[3 * vertIdx + 1] = verticesNew[offset + 4];
    normalsF32[3 * vertIdx + 2] = verticesNew[offset + 5];
    uvF32[2 * vertIdx + 0] = verticesNew[offset + 6];
    uvF32[2 * vertIdx + 1] = verticesNew[offset + 7];
  }

  return {
    vertexCount: newVertexCount,
    positions: positionsF32,
    positionsStride: BYTES_VEC3,
    normals: normalsF32,
    uv: uvF32,
    indices: indicesNew,
    indicesCount: indicesNew.length,
    verticesAndAttributes: verticesNew,
    verticesAndAttributesStride: strideBytes,
    bounds: calculateBounds(positionsF32),
  };
}

const hasNormals = (mesh: ObjMesh) => {
  if (!mesh.vertexNormals || !Array.isArray(mesh.vertexNormals)) return false;
  const firstEl = mesh.vertexNormals[0];
  return typeof firstEl === 'number' && !isNaN(firstEl);
};

type MeshWithTextures = Required<Pick<ObjMesh, 'textures'>>;

const hasUVs = (mesh: ObjMesh): mesh is ObjMesh & MeshWithTextures => {
  if (!mesh.textures || !Array.isArray(mesh.textures)) return false;
  const firstEl = mesh.textures[0];
  return typeof firstEl === 'number' && !isNaN(firstEl);
};

function cleanupRawOBJData(mesh: ObjMesh, scale: number) {
  mesh.vertices = mesh.vertices.map((e: number) => e * scale);

  if (!hasNormals(mesh)) {
    recalcNormals(mesh);
  }

  if (!hasUVs(mesh)) {
    const vertCnt = vertexCount(mesh);
    mesh.textures = createArray(vertCnt * 2).fill(0.5);
  } else {
    for (let i = 0; i < mesh.textures.length; i += 1) {
      let v = mesh.textures[i];
      v = v % 1; // to range [0-1]
      v = v < 0 ? 1.0 - Math.abs(v) : v; // negative to positive
      // v = (i & 1) == 0 ? 1 - v : v; // invert X - not needed
      v = (i & 1) == 1 ? 1 - v : v; // invert Y - webgpu coordinate system
      mesh.textures[i] = v;
    }
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
