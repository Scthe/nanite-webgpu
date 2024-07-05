import { BYTES_VEC3, BYTES_VEC2 } from '../constants.ts';

/** Original mesh as imported from the OBJ file */
export interface GPUOriginalMesh {
  vertexCount: number;
  triangleCount: number;
  vertexBuffer: GPUBuffer;
  normalsBuffer: GPUBuffer;
  uvBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}

export const VERTEX_ATTRIBUTE_POSITION: GPUVertexBufferLayout = {
  attributes: [
    {
      shaderLocation: 0, // position
      offset: 0,
      format: 'float32x3',
    },
  ],
  arrayStride: BYTES_VEC3,
  stepMode: 'vertex',
};

export const VERTEX_ATTRIBUTES: GPUVertexBufferLayout[] = [
  VERTEX_ATTRIBUTE_POSITION,
  {
    attributes: [
      {
        shaderLocation: 1, // normals
        offset: 0,
        format: 'float32x3', // only nanite object uses octahedron normals
      },
    ],
    arrayStride: BYTES_VEC3,
    stepMode: 'vertex',
  },
  {
    attributes: [
      {
        shaderLocation: 2, // uv
        offset: 0,
        format: 'float32x2',
      },
    ],
    arrayStride: BYTES_VEC2,
    stepMode: 'vertex',
  },
];
