import * as MetisModule from '../lib/metis3-1.js';
import { ValueOf, createArray } from '../utils/index.ts';
import { WasmModule } from '../utils/wasm-types.d.ts';
import { metisCall, wasmPtr } from '../utils/wasm.ts';

let METIS_MODULE: WasmModule | undefined = undefined;

/** Used in tests to point to local .wasm file */
export const OVERRIDE_METIS_WASM_PATH = {
  value: undefined as string | undefined,
};

export async function getMetisModule() {
  if (METIS_MODULE !== undefined) return METIS_MODULE;

  const module: WasmModule = await MetisModule.default({
    locateFile: (e: string) => OVERRIDE_METIS_WASM_PATH.value || e,
  });
  METIS_MODULE = module;
  return module;
}

/**
 * Clear the reference so GC can collect the Instance and free the memory.
 * I am too lazy to re-Emscripten metis with free().
 */
export function metisFreeAllocations() {
  METIS_MODULE = undefined;
}

/**
 * Metis manual section 5.4
 *
 * https://github.com/KarypisLab/METIS/blob/e0f1b88b8efcb24ffa0ec55eabb78fbe61e58ae7/include/metis.h#L263
 */
export const METIS_OPTION = {
  OBJTYPE: 1 as const,
  /** Specifies the matching scheme to be used during coarsening. */
  CTYPE: 2 as const,
  /** Determines the algorithm used during initial partitioning.  */
  IPTYPE: 3 as const,
  /** Determines the algorithm used for refinement. */
  RTYPE: 4 as const,
  /** ecifies that the coarsening will not perform any 2–hop matchings when the standard matching approach fails to sufficiently coarsen the graph. */
  NO2HOP: 20 as const,
  /** Specifies the number of different partitionings that it will compute. */
  NCUTS: 8 as const,
  /** Specifies the number of iterations for the refinement algorithms at each stage of the uncoarsening process. */
  NITER: 7 as const,
  /** Specifies the maximum allowed load imbalance among the partitions. */
  UFACTOR: 17 as const,
  /** Specifies that the partitioning routines should try to minimize the maximum degree of the subdomain graph, i.e., the graph in which each partition is a node, and edges connect subdomains with a shared interface. */
  MINCONN: 11 as const,
  /** Specifies that the partitioning routines should try to produce partitions that are contiguous. */
  CONTIG: 12 as const,
  /** Specifies the seed for the random number generator. */
  SEED: 9 as const,
  /** start index is 0 or 1. */
  NUMBERING: 18 as const,
  /** Debug level. */
  DBGLVL: 5 as const,
};

/** The maximum length of the options[] array. https://github.com/KarypisLab/METIS/blob/e0f1b88b8efcb24ffa0ec55eabb78fbe61e58ae7/include/metis.h#L162 */
const METIS_NOPTIONS = 40;

export type MetisOptions = Partial<
  Record<ValueOf<typeof METIS_OPTION>, number>
>;

const METIS_OK = 1; // Returned normally
const METIS_ERROR_INPUT = -2; // Returned due to erroneous inputs and/or options
const METIS_ERROR_MEMORY = -3; // Returned due to insufficient memory
const METIS_ERROR = -4; // Some other errors

/**
 * Use metis to partition the graph.
 *
 * @param adjacency [vertex i][...other vertices to which i is connected]
 * @param nparts number of parts to partition the graph
 * @param opts
 * @returns array of size `nparts`, each contains vertex ids
 */
export function partitionGraph(
  adjacency: number[][],
  nparts: number,
  opts: MetisOptions = {}
) {
  const [xadj, adjncy] = createAdjacencyData(adjacency);
  return partitionGraphImpl(xadj, adjncy, nparts, opts);
}

/** Internal/test use mostly. Call `partitionGraph()` instead. */
export async function partitionGraphImpl(
  xadj: number[],
  adjncy: number[],
  nparts: number,
  opts: MetisOptions = {}
) {
  const module = await getMetisModule();

  const i32Arr = (a: number[]) => wasmPtr(new Int32Array(a));
  const i32 = (a: number) => i32Arr([a]);

  const vertexCount = xadj.length - 1;
  const constraintsCount = 1;
  nparts = Math.ceil(nparts);
  // console.log({ vertexCount, constraintsCount, nparts });

  const objval = new Int32Array(1);
  const parts = new Int32Array(vertexCount);
  const options = createOptions(opts);

  const returnCode = metisCall(module, 'number', 'METIS_PartGraphKway', [
    i32(vertexCount), // idx_t *nvtxs,
    i32(constraintsCount), // idx_t *ncon,
    i32Arr(xadj), // idx_t *xadj,
    i32Arr(adjncy), // idx_t *adjncy,
    null, // idx_t *vwgt,
    null, // idx_t *vsize,
    // TODO [IGNORE] UE5 adjwgt: https://github.com/EpicGames/UnrealEngine/blob/ue5-main/Engine/Source/Developer/NaniteBuilder/Private/GraphPartitioner.cpp#L63
    // https://youtu.be/eviSykqSUUw?si=GttgyFXof02ENUa4&t=1095
    null, // idx_t *adjwgt,
    i32(nparts), // idx_t *nparts,
    null, // real_t *tpwgts,
    null, // real_t *ubvec,
    // TODO [IGNORE] UE5 options: https://github.com/EpicGames/UnrealEngine/blob/ue5-main/Engine/Source/Developer/NaniteBuilder/Private/GraphPartitioner.cpp#L50
    wasmPtr(options), // idx_t *options,
    wasmPtr(objval, 'out'), // idx_t *objval,
    wasmPtr(parts, 'out'), // idx_t *part
  ]);
  checkErrCode(returnCode);
  // console.log('partitionGraph result', parts);

  const result: number[][] = createArray(nparts).map((_) => []);
  parts.forEach((partitionIdx, vertIdx) => {
    result[partitionIdx].push(vertIdx);
  });

  return result;
}

/** https://github.com/KarypisLab/METIS/blob/e0f1b88b8efcb24ffa0ec55eabb78fbe61e58ae7/libmetis/auxapi.c#L36 */
function createOptions(opts: MetisOptions): Int32Array {
  const result = new Int32Array(METIS_NOPTIONS);
  result.fill(-1);

  Object.entries(opts).forEach(([k, v]) => {
    if (v !== undefined) result[parseInt(k, 10)] = v;
  });
  return result;
}

function checkErrCode(code: number) {
  switch (code) {
    case METIS_OK:
      return;
    case METIS_ERROR_INPUT:
      throw new Error(
        '[Metis error] METIS_ERROR_INPUT (Returned due to erroneous inputs and/or options)'
      );
    case METIS_ERROR_MEMORY:
      throw new Error(
        '[Metis error] METIS_ERROR_MEMORY (Returned due to insufficient memory)'
      );
    case METIS_ERROR:
    default:
      throw new Error(`[Metis error] code=${code} (Some other error)`);
  }
}

/**
 * # Section 5.5 Graph data structure
 *
 * In this format the adjacency structure of a graph with **n vertices** and **m edges** is represented using two arrays `xadj` and `adjncy`. The `xadj` array is of size n + 1 whereas the `adjncy` array is of size 2m (this is because for each edge between vertices v and u we actually store both (v; u) and (u; v)).
 *
 * The adjacency structure of the graph is stored as follows. Assuming that **vertex numbering starts from 0 (C style)**, then the **adjacency list of vertex i** is stored in array `adjncy` starting at index `xadj[i]` and ending at (but not including) index `xadj[i + 1]` (i.e., `adjncy[xadj[i]]` through and including `adjncy[xadj[i + 1]-1]`).
 *
 * That is, for each vertex i, its adjacency list is stored in consecutive locations in the array `adjncy`, and the array `xadj` is used to point to where it begins and where it ends.
 */
export function createAdjacencyData(adjacency: number[][]) {
  const adjncy: number[] = [];
  const xadj: number[] = [0];

  for (let i = 0; i < adjacency.length; i++) {
    adjncy.push(...adjacency[i]);
    xadj.push(adjncy.length);
  }

  return [xadj, adjncy];
}
