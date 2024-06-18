import { CO_PER_VERTEX, BYTES_VEC3 } from '../constants.ts';
import MeshOptModule from '../lib/meshoptimizer.js';
import { WasmModule } from '../utils/wasm-types.d.ts';

let MESHOPTIMIZER_MODULE: WasmModule | undefined = undefined;

export async function getMeshOptimizerModule() {
  if (MESHOPTIMIZER_MODULE !== undefined) return MESHOPTIMIZER_MODULE;

  const MeshOpt = await MeshOptModule({
    locateFile: (e: string) => e,
  });
  const module: WasmModule = MeshOpt;
  MESHOPTIMIZER_MODULE = module;
  return module;
}

export type MeshData = {
  indexCount: number;
  vertexCount: number;
  vertexSize: number;
};

/** Get values for names in meshoptimizer */
export const getMeshData = (
  vertices: Float32Array,
  indices: Uint32Array
): MeshData => ({
  indexCount: indices.length,
  vertexCount: vertices.length / CO_PER_VERTEX,
  vertexSize: BYTES_VEC3,
});
