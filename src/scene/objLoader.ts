import * as objLoader from 'webgl-obj-loader';
import { copyToTypedArray } from '../utils/index.ts';
import { optimizeMeshBuffers } from '../meshPreprocessing/optimizeMeshBuffers.ts';

const Mesh = objLoader.default?.Mesh || objLoader.Mesh; // deno vs chrome

export async function loadObjFile(
  objText: string,
  scale: number
): Promise<[Float32Array, Uint32Array]> {
  const mesh = new Mesh(objText);
  const { vertices, indices } = mesh;
  // console.log('unique vertices (may incl. normals)', vertices.length / CO_PER_VERTEX);
  // console.log('indices', indices.length);

  const vertexF32 = copyToTypedArray(
    Float32Array,
    vertices.map((e: number) => e * scale)
  );
  const indexU32 = copyToTypedArray(Uint32Array, indices);

  // optimize
  const [optVertices, optIndices] = await optimizeMeshBuffers(
    vertexF32,
    indexU32
  );
  return [optVertices, optIndices];
}
