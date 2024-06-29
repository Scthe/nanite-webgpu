import { ParsedMesh } from '../scene/objLoader.ts';
import { WasmModule } from '../utils/wasm-types.d.ts';
import { meshoptCall, wasmPtr } from '../utils/wasm.ts';
import { getMeshOptimizerModule } from './meshoptimizerUtils.ts';
// import { MeshoptSimplifier } from 'meshoptimizer'; // Try meshoptimizer's original WASM, see simplify2() below

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

const roundToMultiplyOf3 = (a: number) => Math.floor(a / 3) * 3;

export const calculateTargetIndexCount = (
  originalCount: number,
  decimateFactor: number
) => {
  return roundToMultiplyOf3(originalCount / decimateFactor);
};

/**
 * Reduce triangle count. Mesh will look worse.
 *
 * https://github.com/zeux/meshoptimizer?tab=readme-ov-file#simplification
 */
export async function simplifyMesh(
  mesh: ParsedMesh,
  indices: Uint32Array,
  opts: Opts
) {
  const module = await getMeshOptimizerModule();
  const indicesCount = indices.length;

  opts.targetIndexCount = roundToMultiplyOf3(opts.targetIndexCount);
  opts.targetError = opts.targetError || 0.01;
  opts.lockBorders = opts.lockBorders != false;

  const [error, newIndexCount, result] = simplify(
    module,
    mesh.verticesAndAttributes,
    mesh.vertexCount,
    mesh.verticesAndAttributesStride,
    indices,
    indicesCount,
    opts
  );
  // const [error, newIndexCount, result] = simplify2(mesh, indices, opts);

  const errorScale = simplifyScale(
    module,
    mesh.verticesAndAttributes,
    mesh.vertexCount,
    mesh.verticesAndAttributesStride
  );

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
  vertexCount: number,
  stride: number,
  indices: Uint32Array,
  indicesCount: number,
  opts: Opts
): [number, number, Uint32Array] {
  const result = new Uint32Array(indicesCount);
  const outResultError = new Float32Array(1);

  // meshopt_SimplifyX flags, 0 is a safe default
  const options = opts.lockBorders ? MESHOPT_SIMPLIFY_LOCK_BORDER : 0;

  const newIndexCount = meshoptCall(module, 'number', 'meshopt_simplify', [
    wasmPtr(result, 'out'), // destination
    wasmPtr(indices), // indices
    indicesCount, // index_count
    wasmPtr(vertices), // vertex_positions_data
    vertexCount, // vertex_count
    stride, // vertex_positions_stride
    opts.targetIndexCount, // target_index_count
    opts.targetError!, // target_error
    options, // options
    wasmPtr(outResultError, 'out'), // out_result_error
  ]);
  return [outResultError[0], newIndexCount, result];
}

/*
function simplify2(
  mesh: ParsedMesh,
  indices: Uint32Array,
  opts: Opts
): [number, number, Uint32Array] {
  MeshoptSimplifier.useExperimentalFeatures = true;
  const stride = 3; // in elements?
  const attrs = mesh.uv;
  const attrsWeights = [0.1, 0.1];
  const attrsStride = 2;

  const [result, error] = MeshoptSimplifier.simplifyWithAttributes(
    indices, // indices: Uint32Array
    mesh.positions, // vertex_positions: Float32Array
    stride, // vertex_positions_stride: number
    attrs, // vertex_attributes: Float32Array,
    attrsStride, // vertex_attributes_stride: number,
    attrsWeights, // attribute_weights: number[],
    null, // vertex_lock: boolean[] | null,
    opts.targetIndexCount, // target_index_count: number,
    opts.targetError!, // target_error: number,
    ['LockBorder'] // flags?: Flags[]
  );
  return [error, result.length, result];
}
*/

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/simplifier.cpp#L1903 */
function simplifyScale(
  module: WasmModule,
  vertices: Float32Array,
  vertexCount: number,
  stride: number
): number {
  const scale = meshoptCall(module, 'number', 'meshopt_simplifyScale', [
    wasmPtr(vertices),
    vertexCount,
    stride,
  ]);
  return scale;
}
