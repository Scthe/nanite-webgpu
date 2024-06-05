import { BYTES_VEC3, CO_PER_VERTEX } from '../constants.ts';
import MeshOptModule from '../lib/meshoptimizer';
import { meshoptCall, wasmPtr } from '../utils/wasm';

async function getMeshOptimizerModule() {
  const MeshOpt = await MeshOptModule({
    locateFile: (e: string) => e,
  });
  const module: WebAssembly.Module = await MeshOpt.ready;
  return module;
}

type MeshData = {
  indexCount: number;
  vertexCount: number;
  vertexSize: number;
};

/** Optimize vertex and index buffer.
 *
 * https://github.com/zeux/meshoptimizer?tab=readme-ov-file#indexing
 */
export async function optimizeMeshBuffers(
  vertices: Float32Array,
  indices: Uint32Array
): Promise<[Float32Array, Uint32Array]> {
  const module = await getMeshOptimizerModule();
  const meshData: MeshData = {
    indexCount: indices.length,
    vertexCount: vertices.length / CO_PER_VERTEX,
    vertexSize: BYTES_VEC3,
  };

  const [newVertCnt, remap] = generateVertexRemap(
    module,
    vertices,
    indices,
    meshData
  );
  // console.log('generateVertexRemap res:', newVertCnt);
  // console.log('generateVertexRemap remap:', remap);

  const newIndices = remapIndexBuffer(module, indices, remap);
  const newVertices = remapVertexBuffer(
    module,
    vertices,
    newVertCnt,
    meshData,
    remap
  );
  // console.log('indices', indices, '=>', newIndices);
  // console.log('vertices', vertices, '=>', newVertices);
  return [newVertices, newIndices];
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201 */
function generateVertexRemap(
  module: WebAssembly.Module,
  vertices: Float32Array,
  indices: Uint32Array,
  meshData: MeshData
): [number, Uint32Array] {
  const result = new Uint32Array(indices.length);
  const newVertexCount = meshoptCall(
    module,
    'number',
    'meshopt_generateVertexRemap',
    [
      wasmPtr(result, 'out'),
      wasmPtr(indices),
      meshData.indexCount,
      wasmPtr(vertices),
      meshData.vertexCount,
      meshData.vertexSize,
    ]
  );
  return [newVertexCount, result];
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L341 */
function remapIndexBuffer(
  module: WebAssembly.Module,
  indices: Uint32Array,
  remap: Uint32Array
) {
  const result = new Uint32Array(indices.length);
  meshoptCall(module, 'number', 'meshopt_remapIndexBuffer', [
    wasmPtr(result, 'out'),
    wasmPtr(indices),
    indices.length,
    wasmPtr(remap),
  ]);
  return result;
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L305 */
function remapVertexBuffer(
  module: WebAssembly.Module,
  vertices: Float32Array,
  newVertCnt: number,
  meshData: MeshData,
  remap: Uint32Array
) {
  const result = new Float32Array(newVertCnt * CO_PER_VERTEX);
  meshoptCall(module, 'number', 'meshopt_remapVertexBuffer', [
    wasmPtr(result, 'out'),
    wasmPtr(vertices),
    meshData.vertexCount,
    meshData.vertexSize,
    wasmPtr(remap),
  ]);
  return result;
}
