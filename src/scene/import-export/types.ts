// deno-lint-ignore-file no-explicit-any
import { Bounds3d } from '../../utils/calcBounds.ts';
import { NaniteMeshletTreeNode } from '../naniteObject.ts';
import { ParsedMesh } from '../objLoader.ts';

export type SerializedNode = Omit<NaniteMeshletTreeNode, 'createdFrom'> & {
  createdFrom: Array<NaniteMeshletTreeNode['id']>;
};

export interface SerializedNaniteObject {
  exporterVersion: number;
  name: string;
  bounds: Bounds3d;
  allMeshlets: SerializedNode[];
  roots: Array<NaniteMeshletTreeNode['id']>;
  lodLevelCount: number;
  parsedMesh: Pick<
    ParsedMesh,
    | 'vertexCount'
    | 'positionsStride'
    // | 'verticesAndAttributes'
    | 'verticesAndAttributesStride'
    // | 'indices'
    | 'indicesCount'
    | 'bounds'
  >;
  // meshletIndexBufferData: number[] | Uint32Array;
}

export function serializeNode(node: NaniteMeshletTreeNode): SerializedNode {
  return {
    ...node,
    createdFrom: node.createdFrom.map((n) => n.id),
  };
}

export function deserializeNodes(
  nodes: SerializedNode[]
): NaniteMeshletTreeNode[] {
  const getById = (id: NaniteMeshletTreeNode['id']) => {
    const n = nodes.find((n) => n.id === id);
    if (n == undefined) {
      throw new ImportError(`CreatedFrom node with id='${id}' does not exist`);
    }
    return n;
  };
  nodes.forEach((node) => {
    node.createdFrom = node.createdFrom.map(getById) as any;
    if (node.parentError === null) {
      node.parentError = Infinity;
    }
  });
  return nodes as any;
}

export class ImportError extends Error {
  constructor(msg: string) {
    super(`Invalid file to import. ${msg}`);
  }
}
