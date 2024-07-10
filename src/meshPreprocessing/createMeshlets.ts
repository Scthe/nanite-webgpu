import { vec3 } from 'wgpu-matrix';
import { BYTES_F32, BYTES_U32, VERTS_IN_TRIANGLE } from '../constants.ts';
import { copyToTypedArray } from '../utils/index.ts';
import { WasmModule } from '../utils/wasm-types.d.ts';
import { meshoptCall, wasmPtr } from '../utils/wasm.ts';
import { getMeshOptimizerModule } from './meshoptimizerUtils.ts';
import { ParsedMesh } from '../scene/objLoader.ts';
import {
  meshopt_Meshlets,
  meshopt_Meshlet,
  U32_IN_MESHOPT_MESHLET,
  meshopt_Bounds,
  MESHOPT_BOUNDS_BYTES,
} from './createMeshlets.types.ts';

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
 * https://github.com/zeux/meshoptimizer/issues/531
 */
export async function createMeshlets(
  mesh: ParsedMesh,
  indices: Uint32Array,
  opts: Opts
): Promise<meshopt_Meshlets> {
  // max_vertices=64, max_triangles=124, cone_weight=0
  const module = await getMeshOptimizerModule();
  const indicesCount = indices.length;

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

  const maxMeshlets = buildMeshletsBound(module, indicesCount, opts);

  const [meshletCount, meshletsRaw, meshletVertices, meshletTriangles] =
    buildMeshlets(
      module,
      mesh.positions,
      mesh.vertexCount,
      mesh.positionsStride,
      indices,
      indicesCount,
      opts,
      maxMeshlets
    );

  const meshlets: meshopt_Meshlet[] = [];
  for (let i = 0; i < meshletCount; i += 1) {
    const idx = i * U32_IN_MESHOPT_MESHLET;
    const meshlet: Omit<meshopt_Meshlet, 'bounds'> = {
      vertexOffset: meshletsRaw[idx + 0],
      triangleOffset: meshletsRaw[idx + 1],
      vertexCount: meshletsRaw[idx + 2],
      triangleCount: meshletsRaw[idx + 3],
    };
    /*const bounds = computeMeshletBounds(
      module,
      vertices,
      meshData,
      meshletVertices,
      meshletTriangles,
      meshlet
    );*/
    // console.log('bounds', bounds);

    meshlets.push(meshlet);
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

  // indices: reuse original vertex buffer. ALWAYS ON (PLEASE)!
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

function buildMeshlets(
  module: WasmModule,
  vertices: Float32Array,
  vertexCount: number,
  stride: number,
  indices: Uint32Array,
  indicesCount: number,
  opts: Opts,
  maxMeshlets: number
): [number, Uint32Array, Uint32Array, Uint8Array] {
  // meshlets must contain enough space for all meshlets,
  // worst case size can be computed with meshopt_buildMeshletsBound
  const meshlets = new Uint32Array(maxMeshlets * U32_IN_MESHOPT_MESHLET);
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
    indicesCount, // size_t index_count,
    wasmPtr(vertices), // const float* vertex_positions,
    vertexCount, // size_t vertex_count,
    stride, // size_t vertex_positions_stride
    opts.maxVertices!, // size_t max_vertices,
    opts.maxTriangles!, // size_t max_triangles,
    opts.coneWeight!, // float cone_weight
  ]);
  return [meshletCount, meshlets, meshletVertices, meshletTriangles];
}

function buildMeshletsBound(
  module: WasmModule,
  indicesCount: number,
  opts: Opts
): number {
  // "Looking at the original NVidia mesh shader publication,
  // one concrete number they recommend is 64 vertices
  // and 84 or 126 triangles per meshlet."
  // https://zeux.io/2023/01/16/meshlet-size-tradeoffs/
  return meshoptCall(module, 'number', 'meshopt_buildMeshletsBound', [
    indicesCount,
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

export function splitIndicesPerMeshlets(meshlets: meshopt_Meshlets) {
  let nextIdx = 0;
  return meshlets.meshlets.map((m) => {
    const vertexCount = m.triangleCount * VERTS_IN_TRIANGLE;
    const firstIndex = nextIdx;
    const res = meshlets.meshletTriangles.slice(
      firstIndex,
      firstIndex + vertexCount
    );
    nextIdx += vertexCount;
    return res;
  });
}

function _computeMeshletBounds(
  module: WasmModule,
  vertices: Float32Array,
  vertexCount: number,
  stride: number,
  meshletVertices: Uint32Array,
  meshletTriangles: Uint8Array,
  meshlet: Omit<meshopt_Meshlet, 'bounds'>
): meshopt_Bounds {
  const mVerts = new Uint32Array(
    meshletVertices,
    meshlet.vertexOffset * BYTES_U32
  );
  const mIdx = new Uint8Array(meshletTriangles, meshlet.triangleOffset);
  // console.log('computeMeshletBounds', arguments);

  const returnValueBuffer = new Float32Array(MESHOPT_BOUNDS_BYTES / BYTES_F32);

  const _ret = meshoptCall(module, 'number', 'meshopt_computeMeshletBounds', [
    wasmPtr(returnValueBuffer, 'out'),
    wasmPtr(mVerts), // unsigned int* meshlet_vertices, ||| &meshlet_vertices[m.vertex_offset],
    wasmPtr(mIdx), // unsigned char* meshlet_triangles, ||| &meshlet_triangles[m.triangle_offset],
    meshlet.triangleCount, // size_t triangle_count, ||| m.triangle_count,
    wasmPtr(vertices), // const float* vertex_positions, ||| &vertices[0].x,
    vertexCount, // size_t vertex_count, ||| vertices.size(),
    stride, // size_t vertex_positions_stride ||| sizeof(Vertex)
  ]);

  return parseMeshopt_Bounds(returnValueBuffer);
}

function parseMeshopt_Bounds(data: Float32Array): meshopt_Bounds {
  return {
    center: vec3.create(data[0], data[1], data[2]), // float center[3];
    radius: data[3], // float radius;
    coneApex: vec3.create(data[4], data[5], data[6]), // float cone_apex[3];
    coneAxis: vec3.create(data[7], data[8], data[9]), // float cone_axis[3];
    coneCutoff: data[10], // float cone_cutoff; /* = cos(angle/2) */
  };
}
