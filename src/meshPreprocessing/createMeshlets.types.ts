import { Vec3 } from 'wgpu-matrix';
import { BYTES_F32 } from '../constants.ts';

/** https://github.com/zeux/meshoptimizer/blob/master/src/meshoptimizer.h#L511 */
export interface meshopt_Bounds {
  center: Vec3; // float center[3];
  radius: number; // float radius;
  coneApex: Vec3; // float cone_apex[3];
  coneAxis: Vec3; // float cone_axis[3];
  coneCutoff: number; // float cone_cutoff; /* = cos(angle/2) */
}
export const MESHOPT_BOUNDS_BYTES =
  3 * BYTES_F32 + // float center[3];
  BYTES_F32 + // float radius;
  3 * BYTES_F32 + // float cone_apex[3];
  3 * BYTES_F32 + // float cone_axis[3];
  BYTES_F32 + // float cone_cutoff; /* = cos(angle/2) */
  3 + // signed char cone_axis_s8[3];
  1; // signed char cone_cutoff_s8;

export interface meshopt_Meshlet {
  /* offsets within meshletVertices */
  vertexOffset: number; // unsigned int
  /** number of vertices in the meshlet */
  vertexCount: number; // unsigned int
  /* offsets within meshletTriangles */
  triangleOffset: number; // unsigned int
  /** number of triangles in the meshlet */
  triangleCount: number; // unsigned int
  // bounds?: meshopt_Bounds;
}
export const U32_IN_MESHOPT_MESHLET = 4;

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
