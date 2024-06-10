import { WasmModule } from '../utils/wasm-types.d.ts';
import { meshoptCall, wasmPtr } from '../utils/wasm.ts';
import {
  getMeshOptimizerModule,
  getMeshData,
  MeshData,
} from './meshoptimizerUtils.ts';

/**
 * Do not move vertices that are located on the topological border
 * (vertices on triangle edges that don't have a paired triangle).
 * Useful for simplifying portions of the larger mesh.
 *
 * https://github.com/zeux/meshoptimizer/blob/c9fd0916d56d86fe8bec2803d7b8b0ddcff6ad1a/src/meshoptimizer.h#L329
 */
const MESHOPT_SIMPLIFY_LOCK_BORDER = 1 << 0;

interface Opts {
  targetIndexCount: number;
  /** [0-1], where 0.01 means 1%. */
  targetError?: number;
  lockBorders?: boolean;
}

/**
 * Reduce triangle count. Mesh will look worse.
 *
 * https://github.com/zeux/meshoptimizer?tab=readme-ov-file#simplification
 */
export async function simplifyMesh(
  vertices: Float32Array,
  indices: Uint32Array,
  opts: Opts
) {
  const module = await getMeshOptimizerModule();
  const meshData = getMeshData(vertices, indices);

  opts.targetIndexCount = Math.ceil(opts.targetIndexCount);
  opts.targetError = opts.targetError || 0.01;
  opts.lockBorders = opts.lockBorders != false;

  const [error, newIndexCount, result] = simplify(
    module,
    vertices,
    indices,
    meshData,
    opts
  );

  const errorScale = simplifyScale(module, vertices, meshData);

  return {
    error,
    errorScale,
    indexBuffer: result.slice(0, newIndexCount),
  };
}

/**
 * Reduces the number of triangles in the mesh, attempting to preserve mesh appearance as much as possible.
 *
 * https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201
 */
function simplify(
  module: WasmModule,
  vertices: Float32Array,
  indices: Uint32Array,
  meshData: MeshData,
  opts: Opts
): [number, number, Uint32Array] {
  const result = new Uint32Array(meshData.indexCount);
  const outResultError = new Float32Array(1);

  // meshopt_SimplifyX flags, 0 is a safe default
  const options = opts.lockBorders ? MESHOPT_SIMPLIFY_LOCK_BORDER : 0;

  const newIndexCount = meshoptCall(module, 'number', 'meshopt_simplify', [
    wasmPtr(result, 'out'), // destination
    wasmPtr(indices), // indices
    meshData.indexCount, // index_count
    wasmPtr(vertices), // vertex_positions_data
    meshData.vertexCount, // vertex_count
    meshData.vertexSize, // vertex_positions_stride
    opts.targetIndexCount, // target_index_count
    opts.targetError!, // target_error
    options, // options
    wasmPtr(outResultError, 'out'), // out_result_error
  ]);
  return [outResultError[0], newIndexCount, result];
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/simplifier.cpp#L1903 */
function simplifyScale(
  module: WasmModule,
  vertices: Float32Array,
  meshData: MeshData
): number {
  const scale = meshoptCall(module, 'number', 'meshopt_simplifyScale', [
    wasmPtr(vertices),
    meshData.vertexCount,
    meshData.vertexSize,
  ]);
  return scale;
}
