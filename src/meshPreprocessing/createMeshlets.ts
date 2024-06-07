import { VERTS_IN_TRIANGLE } from '../constants.ts';
import { copyToTypedArray } from '../utils/index.ts';
import { meshoptCall, wasmPtr } from '../utils/wasm.ts';
import {
  getMeshOptimizerModule,
  getMeshData,
  MeshData,
} from './meshoptimizerUtils.ts';

export interface meshopt_Meshlet {
  /* offsets within meshletVertices */
  vertexOffset: number; // unsigned int
  /** number of vertices in the meshlet */
  vertexCount: number; // unsigned int
  /* offsets within meshletTriangles */
  triangleOffset: number; // unsigned int
  /** number of triangles in the meshlet */
  triangleCount: number; // unsigned int
}
const U32_IN_MESHOPT_MESHLET = 4;

export type meshopt_Meshlets = {
  meshlets: meshopt_Meshlet[];
  /**
   * Mapping of the previous positions into new vertex buffer.
   * Each meshlet `m` has a `[m.vertexOffset : m.vertexOffset + m.vertexCount]`
   * slice of this array.
   */
  meshletVertices: Uint32Array;
  /**
   * Indices within a meshlet. Restarts anew for every meshlet.
   * Each value is in range `[0, maxMeshletVertices]`.
   * Each meshlet `m` has a `[m.triangleOffset : m.triangleOffset + m.triangleCount]`
   * slice of this array.
   */
  meshletTriangles: Uint32Array;
};

interface Opts {
  /**https://zeux.io/2023/01/16/meshlet-size-tradeoffs/ */
  maxVertices?: number;
  /** https://zeux.io/2023/01/16/meshlet-size-tradeoffs/ */
  maxTriangles?: number;
  /** cone_weight should be set to 0 when cone culling is not used, and a value between 0 and 1 otherwise to balance between cluster size and cone culling efficiency*/
  coneWeight?: number;
  /**
   * DO NOT ASK, ALWAYS LEAVE THIS ON.
   * THIS OPTION EXISTS ONLY TO INFORM YOU THAT SOMETHING SO IMPORTANT EXISTS.
   * IT'S NOT MEANT TO BE TOGGLED.
   */
  rewriteIndicesToReferenceOriginalVertexBuffer?: boolean;
}

/**
 * Split mesh into meshlets.
 *
 * https://github.com/zeux/meshoptimizer?tab=readme-ov-file#mesh-shading
 */
export async function createMeshlets(
  vertices: Float32Array,
  indices: Uint32Array,
  opts: Opts
): Promise<meshopt_Meshlets> {
  // max_vertices=64, max_triangles=124, cone_weight=0
  const module = await getMeshOptimizerModule();
  const meshData = getMeshData(vertices, indices);
  // "Looking at the original NVidia mesh shader publication,
  // one concrete number they recommend is 64 vertices
  // and 84 or 126 triangles per meshlet."
  // https://zeux.io/2023/01/16/meshlet-size-tradeoffs/
  opts.maxVertices = opts.maxVertices || 64;
  opts.maxTriangles = opts.maxTriangles || 124; // or 126
  opts.coneWeight = opts.coneWeight === undefined ? 0 : opts.coneWeight;
  opts.rewriteIndicesToReferenceOriginalVertexBuffer =
    opts.rewriteIndicesToReferenceOriginalVertexBuffer !== false;
  // console.log('createMeshlets', opts);

  const maxMeshlets = buildMeshletsBound(module, meshData, opts);

  const [meshletCount, meshletsRaw, meshletVertices, meshletTriangles] =
    buildMeshlets(module, vertices, indices, meshData, opts, maxMeshlets);

  const meshlets: meshopt_Meshlet[] = [];
  for (let i = 0; i < meshletCount; i += 1) {
    const idx = i * U32_IN_MESHOPT_MESHLET;
    meshlets.push({
      vertexOffset: meshletsRaw[idx + 0],
      triangleOffset: meshletsRaw[idx + 1],
      vertexCount: meshletsRaw[idx + 2],
      triangleCount: meshletsRaw[idx + 3],
    });
  }

  const lastMeshlet = meshlets.at(-1)!;
  const lastVertexIdx = lastMeshlet.vertexOffset + lastMeshlet.vertexCount;
  const lastTriangleIdx =
    lastMeshlet.triangleOffset + ((lastMeshlet.triangleCount * 3 + 3) & ~3);

  // indices: convert  U8->U32
  let meshletTrianglesU32 = new Uint32Array(lastTriangleIdx);
  for (let i = 0; i < lastTriangleIdx; i++) {
    meshletTrianglesU32[i] = meshletTriangles[i];
  }

  // indices: reuse original vertex buffer. ALWAYS ON PLEASE!
  if (opts.rewriteIndicesToReferenceOriginalVertexBuffer) {
    const rewriteIdxs = meshletIndicesWithOriginalVertexBuffer(
      meshlets,
      meshletVertices,
      meshletTrianglesU32
    );
    meshletTrianglesU32 = copyToTypedArray(Uint32Array, rewriteIdxs);
  } else {
    console.warn(
      "'rewriteIndicesToReferenceOriginalVertexBuffer' is OFF. You are stupid. I will not crash the app. I will enjoy watching you fail."
    );
  }

  return {
    meshlets,
    meshletVertices: meshletVertices.slice(0, lastVertexIdx),
    meshletTriangles: meshletTrianglesU32,
  };
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201 */
function buildMeshlets(
  module: WebAssembly.Module,
  vertices: Float32Array,
  indices: Uint32Array,
  meshData: MeshData,
  opts: Opts,
  maxMeshlets: number
): [number, Uint32Array, Uint32Array, Uint8Array] {
  // meshlets must contain enough space for all meshlets,
  // worst case size can be computed with meshopt_buildMeshletsBound
  const meshlets = new Uint32Array(maxMeshlets * U32_IN_MESHOPT_MESHLET); // TODO *4?
  // meshlet_vertices must contain enough space for all meshlets,
  // worst case size is equal to max_meshlets * max_vertices
  const meshletVertices = new Uint32Array(maxMeshlets * opts.maxVertices!);
  // meshlet_triangles must contain enough space for all meshlets,
  // worst case size is equal to max_meshlets * max_triangles * 3
  const meshletTriangles = new Uint8Array(maxMeshlets * opts.maxTriangles! * 3);

  const meshletCount = meshoptCall(module, 'number', 'meshopt_buildMeshlets', [
    wasmPtr(meshlets, 'out'), // meshopt_Meshlet* meshlets,
    wasmPtr(meshletVertices, 'out'), // unsigned int* meshlet_vertices,
    wasmPtr(meshletTriangles, 'out'), // unsigned char* meshlet_triangles,
    wasmPtr(indices), // const unsigned int* indices,
    meshData.indexCount, // size_t index_count,
    wasmPtr(vertices), // const float* vertex_positions,
    meshData.vertexCount, // size_t vertex_count,
    meshData.vertexSize, // size_t vertex_positions_stride
    opts.maxVertices!, // size_t max_vertices,
    opts.maxTriangles!, // size_t max_triangles,
    opts.coneWeight!, // float cone_weight
  ]);
  return [meshletCount, meshlets, meshletVertices, meshletTriangles];
}

/** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201 */
function buildMeshletsBound(
  module: WebAssembly.Module,
  meshData: MeshData,
  opts: Opts
): number {
  // "Looking at the original NVidia mesh shader publication,
  // one concrete number they recommend is 64 vertices
  // and 84 or 126 triangles per meshlet."
  // https://zeux.io/2023/01/16/meshlet-size-tradeoffs/
  return meshoptCall(module, 'number', 'meshopt_buildMeshletsBound', [
    meshData.indexCount,
    opts.maxVertices!,
    opts.maxTriangles!,
  ]);
}

/** Rewrite meshlet indices to point to the original vertex buffer */
function meshletIndicesWithOriginalVertexBuffer(
  meshlets: meshopt_Meshlet[],
  meshletVertices: Uint32Array,
  meshletTriangles: Uint32Array
) {
  const meshletIndices: number[] = [];
  for (let i = 0; i < meshlets.length; i++) {
    const meshlet = meshlets[i];

    for (let j = 0; j < meshlet.triangleCount * VERTS_IN_TRIANGLE; j++) {
      const o = meshlet.triangleOffset + j;
      const vertexIdxInsideMeshlet = meshletTriangles[o]; // 0-63
      const vertIdx =
        meshletVertices[meshlet.vertexOffset + vertexIdxInsideMeshlet];
      meshletIndices.push(vertIdx);
    }
  }

  return meshletIndices;
}
