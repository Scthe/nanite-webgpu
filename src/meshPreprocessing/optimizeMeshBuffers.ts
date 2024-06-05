import { BYTES_VEC4 } from '../constants';
import MeshOptModule from '../lib/meshoptimizer';
import { meshoptCall, wasmPtr } from '../utils/wasm';

async function getMeshOptimizerModule() {
  const MeshOpt = await MeshOptModule({
    locateFile: (e: string) => e,
  });
  const module: WebAssembly.Module = await MeshOpt.ready; // WebAssembly.Instance
  return module;
}

/** Optimize vertex and index buffer.
 *
 * https://github.com/zeux/meshoptimizer?tab=readme-ov-file#indexing
 */
export async function optimizeMeshBuffers() {
  const module = await getMeshOptimizerModule();

  const vertices = new Float32Array([1.1, 2.2, 3.3]);
  const indices = new Uint32Array([0, 1, 2]);
  const [newVertCnt, remap] = generateVertexRemap(module, vertices, indices);
  console.log('generateVertexRemap res:', newVertCnt);
  console.log('remap:', remap);
  const newIndices = remapIndexBuffer(module, indices, remap);
  const newVertices = remapVertexBuffer(module, vertices, newVertCnt, remap);
  console.log('indices', indices, '||', newIndices);
  console.log('vertices', vertices, '||', newVertices);
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201 */
function generateVertexRemap(
  module: WebAssembly.Module,
  vertices: Float32Array,
  indices: Uint32Array
): [number, Uint32Array] {
  const result = new Uint32Array(indices.length);
  const vertexSize = BYTES_VEC4;
  const res = meshoptCall(module, 'number', 'meshopt_generateVertexRemap', [
    wasmPtr(result, 'out'),
    wasmPtr(indices),
    indices.length,
    wasmPtr(vertices),
    vertices.length,
    vertexSize,
  ]);
  return [res, result];
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
  remap: Uint32Array
) {
  const result = new Float32Array(newVertCnt);
  const vertexSize = BYTES_VEC4;
  meshoptCall(module, 'number', 'meshopt_remapVertexBuffer', [
    wasmPtr(result, 'out'),
    wasmPtr(vertices),
    vertices.length,
    vertexSize,
    wasmPtr(remap),
  ]);
  return result;
}
