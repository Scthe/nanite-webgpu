import * as objLoader from 'webgl-obj-loader';
import { MeshletRenderPckg, Mesh as MyMesh, Scene } from '../scene.ts';
import { createGPUBuffer } from '../utils/webgpu.ts';
import { copyToTypedArray, printBoundingBox } from '../utils/index.ts';
import { CO_PER_VERTEX, VERTS_IN_TRIANGLE } from '../constants.ts';
import { optimizeMeshBuffers } from '../meshPreprocessing/optimizeMeshBuffers.ts';
import { simplifyMesh } from '../meshPreprocessing/simplifyMesh.ts';
import { createMeshlets } from '../meshPreprocessing/createMeshlets.ts';

const Mesh = objLoader.default?.Mesh || objLoader.Mesh; // deno vs chrome

export async function loadObjFile(
  device: GPUDevice,
  objText: string,
  scale: number
): Promise<Scene> {
  const mesh = new Mesh(objText);
  const { vertices, indices } = mesh;
  // console.log('unique vertices (may incl. normals)', vertices.length / CO_PER_VERTEX);
  // console.log('indices', indices.length);

  const vertexF32 = copyToTypedArray(
    Float32Array,
    vertices.map((e: number) => e * scale)
  );
  const indexU32 = copyToTypedArray(Uint32Array, indices);
  const [optVertices, optIndices] = await optimizeMeshBuffers(
    vertexF32,
    indexU32
  );
  // const optVertices = vertexF32; // no optimization
  // const optIndices = indexU32; // no optimization

  /*
  const simplifiedMesh = await simplifyMesh(optVertices, optIndices, {
    targetIndexCount: 300,
    targetError: 0.05,
  });
  console.log('SimplifiedMesh result', simplifiedMesh);
  optIndices = simplifiedMesh.indexBuffer;
  */

  // create GPUBuffers
  const vertexBuffer = createGPUBuffer(
    device,
    'vertices',
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    optVertices
  );
  const indexBuffer = createGPUBuffer(
    device,
    'indices',
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    optIndices
  );

  const vertexCount = optVertices.length / CO_PER_VERTEX;
  const triangleCount = optIndices.length / 3;
  console.log(
    `Parsed file: ${triangleCount} triangles (${optIndices.length} indices), ${vertexCount} vertices`,
    {
      vertexBuffer,
      indexBuffer,
    }
  );
  printBoundingBox(optVertices);

  const myMesh: MyMesh = {
    indexBuffer,
    vertexBuffer,
    vertexCount,
    triangleCount,
  };

  /////////////////
  /// meshlets
  const meshlets = await createMeshlets(optVertices, optIndices, {});

  const meshlet_positions: number[] = [];
  const meshlet_indices: number[] = [];
  for (let i = 0; i < meshlets.meshlets.length; i++) {
    const meshlet = meshlets.meshlets[i];
    const prevVertsCount = meshlet_positions.length / CO_PER_VERTEX;

    for (let v = 0; v < meshlet.vertexCount; v++) {
      const o =
        CO_PER_VERTEX * meshlets.meshletVertices[meshlet.vertexOffset + v];
      meshlet_positions.push(optVertices[o]);
      meshlet_positions.push(optVertices[o + 1]);
      meshlet_positions.push(optVertices[o + 2]);
    }
    for (let t = 0; t < meshlet.triangleCount * VERTS_IN_TRIANGLE; t++) {
      const o = meshlet.triangleOffset + t;
      const idxInsideMeshlet = meshlets.meshletTriangles[o]; // 0-63
      meshlet_indices.push(prevVertsCount + idxInsideMeshlet);
    }
    /* Reuse old vertex buffer (draft)
    for (let t = 0; t < meshlet.triangleCount * VERTS_IN_TRIANGLE; t++) {
      const o = meshlet.triangleOffset + t;
      const idxInsideMeshlet = meshlets.meshletTriangles[o]; // 0-63
      const vertIdx =
        meshlets.meshletVertices[prevVertsCount + idxInsideMeshlet];
      meshlet_indices.push(vertIdx);
    }*/
  }
  const meshletVertices = copyToTypedArray(Float32Array, meshlet_positions);
  const meshletIndices = copyToTypedArray(Uint32Array, meshlet_indices);
  // printMinMax('meshletVertices', meshletVertices);
  // printMinMax('meshletIndices', meshletIndices);

  const meshletVertexBuffer = createGPUBuffer(
    device,
    'meshlets-vertices',
    GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    meshletVertices
  );
  const meshletIndexBuffer = createGPUBuffer(
    device,
    'meshlets-indices',
    GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
    meshletIndices
  );
  const meshletsObj: MeshletRenderPckg = {
    ...meshlets,
    vertexBuffer: meshletVertexBuffer,
    indexBuffer: meshletIndexBuffer,
  };

  return { mesh: myMesh, meshlets: meshletsObj };
}
