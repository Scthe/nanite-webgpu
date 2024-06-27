import { BYTES_F32 } from '../constants.ts';
import { getMeshOptimizerModule } from './meshoptimizerUtils.ts';
import { meshoptCall, wasmPtr } from '../utils/wasm.ts';
import { WasmModule } from '../utils/wasm-types.d.ts';

/**
 * Optimize vertex and index buffer.
 *
 * https://github.com/zeux/meshoptimizer?tab=readme-ov-file#indexing
 */
export async function optimizeMeshBuffers(
  vertices: Float32Array,
  vertexCount: number,
  stride: number,
  indices: Uint32Array
): Promise<[Float32Array, Uint32Array]> {
  const module = await getMeshOptimizerModule();
  const indexCount = indices.length;

  const [newVertCnt, remap] = generateVertexRemap(
    module,
    vertices,
    vertexCount,
    stride,
    indices,
    indexCount
  );
  // console.log('generateVertexRemap res:', newVertCnt);
  // console.log('generateVertexRemap remap:', remap);

  const newIndices = remapIndexBuffer(module, indices, indexCount, remap);
  const newVertices = remapVertexBuffer(
    module,
    vertices,
    vertexCount,
    stride,
    newVertCnt,
    remap
  );
  // console.log('indices', indices, '=>', newIndices);
  // console.log('vertices', vertices, '=>', newVertices);
  return [newVertices, newIndices];
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201 */
function generateVertexRemap(
  module: WasmModule,
  vertices: Float32Array,
  vertexCount: number,
  stride: number,
  indices: Uint32Array,
  indexCount: number
): [number, Uint32Array] {
  const result = new Uint32Array(indexCount);
  const newVertexCount = meshoptCall(
    module,
    'number',
    'meshopt_generateVertexRemap',
    [
      wasmPtr(result, 'out'),
      wasmPtr(indices),
      indexCount,
      wasmPtr(vertices),
      vertexCount,
      stride,
    ]
  );
  return [newVertexCount, result];
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L341 */
function remapIndexBuffer(
  module: WasmModule,
  indices: Uint32Array,
  indexCount: number,
  remap: Uint32Array
) {
  const result = new Uint32Array(indexCount);
  meshoptCall(module, 'number', 'meshopt_remapIndexBuffer', [
    wasmPtr(result, 'out'),
    wasmPtr(indices),
    indexCount,
    wasmPtr(remap),
  ]);
  return result;
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L305 */
function remapVertexBuffer(
  module: WasmModule,
  vertices: Float32Array,
  oldVertCnt: number,
  stride: number,
  newVertCnt: number,
  remap: Uint32Array
) {
  const result = new Float32Array((newVertCnt * stride) / BYTES_F32);
  meshoptCall(module, 'number', 'meshopt_remapVertexBuffer', [
    wasmPtr(result, 'out'),
    wasmPtr(vertices),
    oldVertCnt,
    stride,
    wasmPtr(remap),
  ]);
  return result;
}
