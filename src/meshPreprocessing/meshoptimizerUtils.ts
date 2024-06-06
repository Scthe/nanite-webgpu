import { CO_PER_VERTEX, BYTES_VEC3 } from '../constants.ts';
import MeshOptModule from '../lib/meshoptimizer';

let MESHOPTIMIZER_MODULE: WebAssembly.Module | undefined = undefined;

export async function getMeshOptimizerModule() {
  if (MESHOPTIMIZER_MODULE !== undefined) return MESHOPTIMIZER_MODULE;

  const MeshOpt = await MeshOptModule({
    locateFile: (e: string) => e,
  });
  const module: WebAssembly.Module = await MeshOpt.ready;
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
