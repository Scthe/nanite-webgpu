import { BYTES_U32, CONFIG } from '../../constants.ts';
import { MeshletWIP } from '../../meshPreprocessing/index.ts';
import { getTriangleCount, getBytesForTriangles } from '../../utils/index.ts';
import { GPUOriginalMesh } from '../GPUOriginalMesh.ts';
import { ParsedMesh } from '../objLoader.ts';
import {
  BYTES_DRAWN_IMPOSTORS_PARAMS,
  createDrawnImpostorsBuffer,
} from './drawnImpostorsBuffer.ts';
import {
  BYTES_DRAWN_INSTANCES_PARAMS,
  createDrawnInstanceIdsBuffer,
} from './drawnInstancesBuffer.ts';
import {
  BYTES_DRAWN_MESHLETS_PARAMS,
  createDrawnMeshletsBuffer,
} from './drawnMeshletsBuffer.ts';
import { createMeshletsDataBuffer } from './meshletsDataBuffer.ts';
import { createOctahedronNormals } from './vertexNormalsBuffer.ts';
import { createNaniteVertexPositionsBuffer } from './vertexPositionsBuffer.ts';

export class NaniteObjectBuffers {
  /** Allocate single shared index buffer. Meshlets will use slices of it */
  public readonly indexBuffer: GPUBuffer = undefined!;

  /** GPU-flow: data for meshlets (NaniteMeshletTreeNode) uploaded to the GPU */
  public readonly meshletsDataBuffer: GPUBuffer = undefined!;

  ///////////////
  // vertex buffers

  /** SSBO with `array<vec3f>` does not work. Forces `array<vec4f>`.
   * TODO [MEDIUM] https://momentsingraphics.de/ToyRenderer2SceneManagement.html#Quantization,
   */
  public readonly vertexPositionsBuffer: GPUBuffer = undefined!;
  public readonly vertexNormalsBuffer: GPUBuffer = undefined!;
  public readonly vertexUVsBuffer: GPUBuffer = undefined!;

  ///////////////
  // buffers that hold per-frame data

  /** GPU-flow: Result of instance culling. Holds 1 dispatch indirect, object bounding sphere, and `Array<tfxId>` */
  public readonly drawnInstancesBuffer: GPUBuffer = undefined!;
  /** GPU-flow: Draw params and instanceIds for billboards. Holds 1 draw indirect and `Array<tfxId>` */
  public readonly drawnImpostorsBuffer: GPUBuffer = undefined!;
  /** GPU-flow: temporary structure between passes. Holds 1 draw indirect and `Array<(tfxId, meshletId)>` */
  public readonly drawnMeshletsBuffer: GPUBuffer = undefined!;

  constructor(
    device: GPUDevice,
    name: string,
    originalMesh: GPUOriginalMesh,
    loadedObj: ParsedMesh,
    allWIPMeshlets: MeshletWIP[],
    instanceCount: number
  ) {
    // convinence for testing
    if (CONFIG.isTest && device == undefined) {
      return;
    }

    this.indexBuffer = createIndexBuffer(device, name, allWIPMeshlets);
    this.vertexPositionsBuffer = createNaniteVertexPositionsBuffer(
      device,
      name,
      loadedObj.positions
    );
    this.vertexNormalsBuffer = createOctahedronNormals(
      device,
      name,
      loadedObj.normals
    );
    this.vertexUVsBuffer = originalMesh.uvBuffer;
    this.meshletsDataBuffer = createMeshletsDataBuffer(
      device,
      name,
      allWIPMeshlets.length
    );
    this.drawnMeshletsBuffer = createDrawnMeshletsBuffer(
      device,
      name,
      allWIPMeshlets,
      instanceCount
    );
    this.drawnInstancesBuffer = createDrawnInstanceIdsBuffer(
      device,
      name,
      allWIPMeshlets.length,
      instanceCount,
      loadedObj.bounds.sphere
    );
    this.drawnImpostorsBuffer = createDrawnImpostorsBuffer(
      device,
      name,
      instanceCount
    );
  }

  bindIndexBuffer = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.indexBuffer },
  });

  bindVertexPositions = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.vertexPositionsBuffer },
  });

  bindVertexNormals = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.vertexNormalsBuffer },
  });

  bindVertexUVs = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.vertexUVsBuffer },
  });

  bindMeshletData = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.meshletsDataBuffer },
  });

  ///////////////////////
  // Drawn meshlets

  cmdClearDrawnMeshletsParams(cmdBuf: GPUCommandEncoder) {
    cmdBuf.clearBuffer(this.drawnMeshletsBuffer, 0, 4 * BYTES_U32);
  }

  bindDrawnMeshletsParams = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.drawnMeshletsBuffer,
      offset: 0,
      size: BYTES_DRAWN_MESHLETS_PARAMS,
    },
  });

  bindDrawnMeshletsList = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.drawnMeshletsBuffer,
      offset: BYTES_DRAWN_MESHLETS_PARAMS,
    },
  });

  ///////////////////////
  // Drawn instances

  cmdClearDrawnInstancesDispatchParams(cmdBuf: GPUCommandEncoder) {
    cmdBuf.clearBuffer(this.drawnInstancesBuffer, 0, 4 * BYTES_U32);
  }

  bindDrawnInstancesParams = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.drawnInstancesBuffer,
      offset: 0,
      size: BYTES_DRAWN_INSTANCES_PARAMS,
    },
  });

  bindDrawnInstancesList = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.drawnInstancesBuffer,
      offset: BYTES_DRAWN_INSTANCES_PARAMS,
    },
  });

  ///////////////////////
  // Drawn impostors

  cmdClearDrawnImpostorsParams(cmdBuf: GPUCommandEncoder) {
    cmdBuf.clearBuffer(this.drawnImpostorsBuffer, 0, 4 * BYTES_U32);
  }

  bindDrawnImpostorsParams = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.drawnImpostorsBuffer,
      offset: 0,
      size: BYTES_DRAWN_IMPOSTORS_PARAMS,
    },
  });

  bindDrawnImpostorsList = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: {
      buffer: this.drawnImpostorsBuffer,
      offset: BYTES_DRAWN_IMPOSTORS_PARAMS,
    },
  });
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
