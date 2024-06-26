import { VERTS_IN_TRIANGLE } from '../constants.ts';
import {
  createMeshlets,
  meshopt_Meshlets,
} from '../meshPreprocessing/createMeshlets.ts';
import { simplifyMesh } from '../meshPreprocessing/simplifyMesh.ts';
import { getTriangleCount, getVertexCount } from '../utils/index.ts';
import { createGPU_IndexBuffer } from '../utils/webgpu.ts';

export interface DebugMeshes {
  mesh: GPUMesh;
  meshlets: MeshletRenderPckg;
  meshoptimizerLODs: GPUMesh[];
  meshoptimizerMeshletLODs: MeshletRenderPckg[];
}

/** Used only in debug */
export interface GPUMesh {
  vertexCount: number;
  triangleCount: number;
  vertexBuffer: GPUBuffer;
  normalsBuffer: GPUBuffer;
  uvBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
}

/** Used only in debug */
export type MeshletRenderPckg = meshopt_Meshlets & {
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
};

export async function createDebugMeshes(
  device: GPUDevice,
  originalMesh: GPUMesh,
  originalVertices: Float32Array,
  originalIndices: Uint32Array
): Promise<DebugMeshes> {
  const meshlets = await createMeshletsMesh(
    device,
    originalMesh,
    originalVertices,
    originalIndices
  );

  const meshoptimizerLODs = await createMeshLODs(
    device,
    originalMesh,
    originalVertices,
    originalIndices
  );

  const meshoptimizerMeshletLODsAsync = meshoptimizerLODs.map(
    ([lodMesh, indices], level) => {
      return createMeshletsMesh(
        device,
        lodMesh,
        originalVertices,
        indices,
        `-lod${level}`
      );
    }
  );
  const meshoptimizerMeshletLODs = await Promise.all(
    meshoptimizerMeshletLODsAsync
  );

  return {
    mesh: originalMesh,
    meshlets,
    meshoptimizerLODs: meshoptimizerLODs.map((e) => e[0]),
    meshoptimizerMeshletLODs,
  };
}

async function createMeshLODs(
  device: GPUDevice,
  originalMesh: GPUMesh,
  vertices: Float32Array,
  originalIndices: Uint32Array
): Promise<Array<[GPUMesh, Uint32Array]>> {
  const MAX_LODS = 10;
  const originalTriangleCount = getTriangleCount(originalIndices);
  const finalTargetTriangleCount = originalTriangleCount / 10;
  let triangleCount = originalTriangleCount;
  const meshLODs: Array<[GPUMesh, Uint32Array]> = [];

  const addMeshLod = (mesh: GPUMesh, indexData: Uint32Array) => {
    meshLODs.push([mesh, indexData]);
  };
  addMeshLod(originalMesh, originalIndices);

  while (
    triangleCount > finalTargetTriangleCount &&
    meshLODs.length < MAX_LODS
  ) {
    const level = meshLODs.length;

    const targetIndexCount = (triangleCount * VERTS_IN_TRIANGLE) / 2;
    // TBH we should use last indices instead of original mesh. Though this is debug view..
    const simplifiedMesh = await simplifyMesh(vertices, originalIndices, {
      targetIndexCount,
      targetError: 0.05,
    });
    const newTriangleCount = getTriangleCount(simplifiedMesh.indexBuffer);
    if (newTriangleCount === originalTriangleCount) break; // cannot be simplified
    /*console.log(
      `LOD [${level}] (${triangleCount}->${newTriangleCount})`,
      simplifiedMesh
    );*/
    triangleCount = newTriangleCount;

    const indexBuffer = createGPU_IndexBuffer(
      device,
      `dbg-lod-test-index-buffer-${level}`,
      simplifiedMesh.indexBuffer
    );
    const meshLod: GPUMesh = {
      ...originalMesh,
      indexBuffer,
      vertexCount: getVertexCount(vertices),
      triangleCount: getTriangleCount(simplifiedMesh.indexBuffer),
    };
    addMeshLod(meshLod, simplifiedMesh.indexBuffer);
  }

  return meshLODs;
}

async function createMeshletsMesh(
  device: GPUDevice,
  originalMesh: GPUMesh,
  vertices: Float32Array,
  indices: Uint32Array,
  labelSuffix: string = ''
): Promise<MeshletRenderPckg> {
  const meshlets = await createMeshlets(vertices, indices, {});

  const meshletIndexBuffer = createGPU_IndexBuffer(
    device,
    `dbg-meshlets-indices${labelSuffix}`,
    meshlets.meshletTriangles
  );

  return {
    ...meshlets,
    vertexBuffer: originalMesh.vertexBuffer, // reuse <3
    indexBuffer: meshletIndexBuffer,
  };
}
