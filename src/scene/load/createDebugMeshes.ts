import { VERTS_IN_TRIANGLE } from '../../constants.ts';
import { createMeshlets } from '../../meshPreprocessing/createMeshlets.ts';
import { simplifyMesh } from '../../meshPreprocessing/simplifyMesh.ts';
import { getTriangleCount, getVertexCount } from '../../utils/index.ts';
import { createGPU_IndexBuffer } from '../../utils/webgpu.ts';
import { GPUOriginalMesh } from '../GPUOriginalMesh.ts';
import { ParsedMesh } from '../objLoader.ts';
import { DebugMeshes, MeshletRenderPckg } from '../scene.ts';

export async function createDebugMeshes(
  device: GPUDevice,
  originalMesh: GPUOriginalMesh,
  parsedMesh: ParsedMesh
): Promise<DebugMeshes> {
  const originalIndices = parsedMesh.indices;

  const meshlets = await createMeshletsMesh(
    device,
    originalMesh,
    parsedMesh,
    originalIndices
  );

  const meshoptimizerLODs = await createMeshLODs(
    device,
    originalMesh,
    parsedMesh,
    originalIndices
  );

  const meshoptimizerMeshletLODsAsync = meshoptimizerLODs.map(
    ([lodMesh, indices], level) => {
      return createMeshletsMesh(
        device,
        lodMesh,
        parsedMesh,
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
  originalMesh: GPUOriginalMesh,
  parsedMesh: ParsedMesh,
  originalIndices: Uint32Array
): Promise<Array<[GPUOriginalMesh, Uint32Array]>> {
  const MAX_LODS = 10;
  const vertices = parsedMesh.positions;
  const originalTriangleCount = getTriangleCount(originalIndices);
  const finalTargetTriangleCount = originalTriangleCount / 10;
  let triangleCount = originalTriangleCount;
  const meshLODs: Array<[GPUOriginalMesh, Uint32Array]> = [];

  const addMeshLod = (mesh: GPUOriginalMesh, indexData: Uint32Array) => {
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
    const simplifiedMesh = await simplifyMesh(parsedMesh, originalIndices, {
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
    const meshLod: GPUOriginalMesh = {
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
  originalMesh: GPUOriginalMesh,
  mesh: ParsedMesh,
  indices: Uint32Array,
  labelSuffix: string = ''
): Promise<MeshletRenderPckg> {
  const meshlets = await createMeshlets(mesh, indices, {});

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
