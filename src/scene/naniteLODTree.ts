import { BYTES_U32, BYTES_VEC4, VERTS_IN_TRIANGLE } from '../constants.ts';
import { MeshletWIP } from '../meshPreprocessing/index.ts';
import { getTriangleCount } from '../utils/index.ts';

export type MeshletId = number;

export type NaniteMeshletTreeNode = Pick<
  MeshletWIP,
  | 'id'
  | 'lodLevel'
  | 'bounds'
  | 'maxSiblingsError'
  | 'parentBounds'
  | 'parentError'
> & {
  triangleCount: number;
  firstIndexOffset: number;
  createdFrom: NaniteMeshletTreeNode[];
};

const GPU_MESHLET_SIZE_BYTES = BYTES_VEC4 + BYTES_VEC4 + 4 * BYTES_U32;

export class NaniteLODTree {
  public readonly allMeshlets: Array<NaniteMeshletTreeNode> = [];
  /** GPU-flow: data for meshlets (NaniteMeshletTreeNode) uploaded to GPU*/
  public readonly meshletsBuffer: GPUBuffer;
  /** GPU-flow: temporary structure between passes. Holds 1 draw indirect and Array<(tfxId, meshletId)> */
  public readonly visiblityBuffer: GPUBuffer;

  constructor(
    public readonly vertexBuffer: GPUBuffer,
    public readonly indexBuffer: GPUBuffer,
    device: GPUDevice,
    meshletCount: number
  ) {
    this.meshletsBuffer = device.createBuffer({
      label: 'nanite-meshlets',
      size: meshletCount * GPU_MESHLET_SIZE_BYTES,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.STORAGE,
    });
    // TODO [many objects]: this.visiblityBuffer can be shared between objects - one per scene, not per object. Or one per object for pararel object process? Then it should also include the indirect draw call args.
    this.visiblityBuffer = device.createBuffer({
      label: 'nanite-visiblity',
      size: meshletCount * BYTES_U32,
      usage:
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_SRC, // TODO SRC is only for tests
    });
  }

  find = (id: MeshletId) => this.allMeshlets.find((m) => m.id === id);

  contains = (id: MeshletId) => this.find(id) !== undefined;

  get lodLevelCount() {
    return 1 + this.root.lodLevel;
  }

  get root() {
    return this.allMeshlets[0];
  }

  get totalTriangleCount() {
    return this.allMeshlets.reduce((acc, m) => acc + m.triangleCount, 0);
  }

  get totalIndicesCount() {
    return VERTS_IN_TRIANGLE * this.totalTriangleCount;
  }

  get meshletCount() {
    return this.allMeshlets.length;
  }

  /** Bottom meshlet LOD level is pre-nanite */
  get preNaniteStats() {
    let triangleCount = 0;
    let meshletCount = 0;
    this.allMeshlets.forEach((m) => {
      if (m.lodLevel === 0) {
        triangleCount += m.triangleCount;
        meshletCount += 1;
      }
    });
    return [meshletCount, triangleCount];
  }

  /** Upload final meshlet data to the GPU */
  finalizeCreation(device: GPUDevice) {
    const actualSize = this.meshletCount * GPU_MESHLET_SIZE_BYTES;
    if (actualSize !== this.meshletsBuffer.size) {
      // prettier-ignore
      throw new Error(`GPU meshlet data preallocated ${this.meshletsBuffer.size} bytes, but ${actualSize} bytes (${this.meshletCount} meshlets * ${GPU_MESHLET_SIZE_BYTES}) are needed`);
    }

    let offsetBytes = 0;
    const data = new ArrayBuffer(GPU_MESHLET_SIZE_BYTES);
    const dataAsF32 = new Float32Array(data);
    const dataAsU32 = new Uint32Array(data);
    this.allMeshlets.forEach((m) => {
      dataAsF32[0] = m.bounds.center[0];
      dataAsF32[1] = m.bounds.center[1];
      dataAsF32[2] = m.bounds.center[2];
      dataAsF32[3] = m.maxSiblingsError;
      dataAsF32[4] = m.parentBounds?.center[0] || 0.0;
      dataAsF32[5] = m.parentBounds?.center[1] || 0.0;
      dataAsF32[6] = m.parentBounds?.center[2] || 0.0;
      dataAsF32[7] = m.parentError === Infinity ? 9999999.0 : m.parentError;
      // u32's:
      dataAsU32[8] = m.id;
      dataAsU32[9] = m.triangleCount;
      dataAsU32[10] = m.firstIndexOffset;
      dataAsU32[12] = 0;
      device.queue.writeBuffer(
        this.meshletsBuffer,
        offsetBytes,
        data,
        0,
        GPU_MESHLET_SIZE_BYTES
      );
      offsetBytes += GPU_MESHLET_SIZE_BYTES;
    });
  }

  /** Used only during construction */
  addMeshlet(m: MeshletWIP, firstIndexOffset: number) {
    const existing = this.find(m.id);
    if (existing) {
      return existing;
    }

    const node: NaniteMeshletTreeNode = {
      id: m.id,
      lodLevel: m.lodLevel,
      bounds: m.bounds,
      maxSiblingsError: m.maxSiblingsError,
      parentBounds: m.parentBounds,
      parentError: m.parentError,
      firstIndexOffset,
      triangleCount: getTriangleCount(m.indices),
      createdFrom: [], // filled once all nodes created in the tree
    };

    this.allMeshlets.push(node);
    return node;
  }
}
