import { BYTES_U32, CONFIG } from '../constants.ts';
import { NaniteMeshletTreeNode, NaniteObject } from '../scene/naniteObject.ts';
import {
  createArray,
  getBytesForTriangles,
  getTriangleCount,
} from '../utils/index.ts';
import { MeshletWIP, isWIP_Root } from '../meshPreprocessing/index.ts';
import { calculateBounds } from '../utils/calcBounds.ts';
import { GPUMesh } from './debugMeshes.ts';
import { ParsedMesh } from './objLoader.ts';
import { assertValidNaniteObject } from './utils/assertValidNaniteObject.ts';
import { NaniteInstancesData } from './instancesData.ts';
import { createDrawnInstanceIdsBuffer } from './naniteBuffers/drawnInstancesBuffer.ts';
import { createDrawnImpostorsBuffer } from './naniteBuffers/drawnImpostorsBuffer.ts';
import { ImpostorBillboardTexture } from './renderImpostors/renderImpostors.ts';
import { createMeshletsDataBuffer } from './naniteBuffers/meshletsDataBuffer.ts';
import { createDrawnMeshletsBuffer } from './naniteBuffers/drawnMeshletsBuffer.ts';
import { createNaniteVertexPositionsBuffer } from './naniteBuffers/vertexPositionsBuffer.ts';
import { createOctahedronNormals } from './naniteBuffers/vertexNormalsBuffer.ts';

export function createNaniteObject(
  device: GPUDevice,
  name: string,
  originalMesh: GPUMesh,
  loadedObj: ParsedMesh,
  allWIPMeshlets: MeshletWIP[],
  instances: NaniteInstancesData,
  impostor: ImpostorBillboardTexture
): NaniteObject {
  // allocate single shared index buffer. Meshlets will use slices of it
  const indexBuffer = createIndexBuffer(device, name, allWIPMeshlets);
  const vertexPositionsAsVec4Buffer = createNaniteVertexPositionsBuffer(
    device,
    name,
    loadedObj.positions
  );
  const octahedronNormalsBuffer = createOctahedronNormals(
    device,
    name,
    loadedObj.normals
  );
  const meshletsBuffer = createMeshletsDataBuffer(
    device,
    name,
    allWIPMeshlets.length
  );
  const visiblityBuffer = createDrawnMeshletsBuffer(
    device,
    name,
    allWIPMeshlets,
    instances.count
  );
  const instanceCullBuffer = createDrawnInstanceIdsBuffer(
    device,
    name,
    allWIPMeshlets.length,
    instances.count,
    loadedObj.bounds.sphere
  );
  const billboardImpostorsBuffer = createDrawnImpostorsBuffer(
    device,
    name,
    instances.count
  );

  const naniteObject = new NaniteObject(
    name,
    loadedObj.bounds,
    originalMesh,
    vertexPositionsAsVec4Buffer,
    octahedronNormalsBuffer,
    indexBuffer,
    meshletsBuffer,
    visiblityBuffer,
    instanceCullBuffer,
    billboardImpostorsBuffer,
    impostor,
    instances
  );

  // write meshlets to the LOD tree
  let indexBufferOffsetBytes = 0;
  let nextId = 0; // id in the index buffer order
  const rewriteIds = createArray(naniteObject.meshletCount);

  // array of [parentNode, meshletToCheck]
  const roots = allWIPMeshlets.filter(isWIP_Root);
  const meshletsToCheck: Array<
    [NaniteMeshletTreeNode | undefined, MeshletWIP]
  > = roots.map((m) => [undefined, m]);

  while (meshletsToCheck.length > 0) {
    const [parentNode, meshlet] = meshletsToCheck.shift()!; // remove 1st from queue

    if (naniteObject.contains(meshlet.id)) {
      continue;
    }

    // create meshlet
    const ownBounds = calculateBounds(loadedObj.positions, meshlet.indices);
    const node = naniteObject.addMeshlet(
      parentNode,
      meshlet,
      indexBufferOffsetBytes / BYTES_U32,
      ownBounds
    );

    // write index buffer slice
    device.queue.writeBuffer(
      indexBuffer,
      indexBufferOffsetBytes,
      meshlet.indices,
      0
    );
    indexBufferOffsetBytes += getBytesForTriangles(node.triangleCount);

    // rewrite id's to be in index buffer order
    rewriteIds[meshlet.id] = nextId;
    nextId += 1;

    // schedule child nodes processing
    meshlet.createdFrom.forEach((m) => {
      if (m) {
        meshletsToCheck.push([node, m]);
      }
    });
  }

  // assert all added OK
  if (allWIPMeshlets.length !== naniteObject.allMeshlets.length) {
    // prettier-ignore
    throw new Error(`Created ${allWIPMeshlets.length} meshlets, but only ${naniteObject.allMeshlets.length} were added to the LOD tree? Please verify '.createdFrom' for all meshlets.`);
  }

  // rewrite id's to be in index buffer order
  // This should be the last step, as we use ids all over the place.
  // After this step, MeshletWIP[_].id !== naniteLODTree.allMeshlets[_].id
  naniteObject.allMeshlets.forEach((m) => {
    m.id = rewriteIds[m.id];
  });

  // upload meshlet data to the GPU for GPU visibility check/render
  naniteObject.finalizeNaniteObject(device);

  // finalize
  assertValidNaniteObject(naniteObject);

  // print stats
  if (!CONFIG.isTest) {
    console.log('[Nanite] All meshlets:', naniteObject.allMeshlets);
    console.log('[Nanite] Root meshlets:', naniteObject.roots);
    console.log(
      `[Nanite] Created LOD levels: ${naniteObject.lodLevelCount} (total ${naniteObject.meshletCount} meshlets from ${naniteObject.rawMeshletCount} bottom level meshlets)`
    );
  }

  return naniteObject;
}

function createIndexBuffer(
  device: GPUDevice,
  name: string,
  meshlets: MeshletWIP[]
): GPUBuffer {
  const totalTriangleCount = meshlets.reduce(
    (acc, m) => acc + getTriangleCount(m.indices),
    0
  );
  return device.createBuffer({
    label: `${name}-nanite-index-buffer`,
    size: getBytesForTriangles(totalTriangleCount),
    usage:
      GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
  });
}
