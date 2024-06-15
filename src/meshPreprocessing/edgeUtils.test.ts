import { assertEquals, assertExists } from 'assert';
import {
  Edge,
  createEdge,
  findAdjacentMeshlets_Iter,
  findAdjacentMeshlets_Map,
  findBoundaryEdges,
  isSameEdge,
  listAllEdges,
} from './edgesUtils.ts';

function assertEdgesMatch(actual: Edge[], expected: Edge[]) {
  assertEquals(actual.length, expected.length);
  expected.forEach((ee) => {
    assertExists(
      actual.find((resE) => isSameEdge(resE, ee)),
      `Missing: ${JSON.stringify(ee)}`
    );
  });
}

Deno.test('edgeUtils :: listAllEdges', () => {
  const data = [
    [0, 1, 2],
    [1, 20, 9999],
  ];
  const indices = new Uint32Array(data.flat());

  const result = listAllEdges(indices);

  const expectedEdges: Edge[] = [
    createEdge(0, 1),
    createEdge(1, 2),
    createEdge(0, 2),
    createEdge(1, 20),
    createEdge(1, 9999),
    createEdge(20, 9999),
  ];
  assertEdgesMatch(result, expectedEdges);
});

Deno.test('edgeUtils :: findBoundaryEdges', () => {
  const edge0 = createEdge(0, 1);
  const edge1 = createEdge(1, 2);
  const edge2 = createEdge(111, 999);
  const edge3 = createEdge(0, 50);

  const allEdges: Edge[] = [
    edge2, // duplicated - not boundary
    edge0, // duplicated - not boundary
    edge0, // duplicated - not boundary
    edge1,
    edge2, // duplicated - not boundary
    edge3,
  ];

  const result = findBoundaryEdges(allEdges);
  // console.log(result);

  assertEdgesMatch(result, [edge1, edge3]);
});

Deno.test('edgeUtils :: findAdjacentMeshlets', async (t) => {
  const sharedEdge0 = createEdge(0, 1);
  const sharedEdge1 = createEdge(100, 101);
  const sharedEdge2 = createEdge(103, 104);

  // meshlet definition
  const meshlet0 = [createEdge(1, 2), sharedEdge0, sharedEdge1, sharedEdge2];
  const meshlet1 = [
    createEdge(5000, 5001),
    createEdge(5001, 5002),
    createEdge(5000, 5002),
  ];
  const meshlet2 = [sharedEdge0, createEdge(0, 11), createEdge(1, 11)];
  const meshlet3 = [
    sharedEdge1,
    sharedEdge2, // shares 2 edges with meshlet0
    createEdge(100, 11),
    createEdge(103, 11),
  ];

  const assertResult = (result: number[][]) => {
    assertEquals(result.length, 4);
    assertEquals(result[0], [2, 3]);
    assertEquals(result[1], []);
    assertEquals(result[2], [0]);
    assertEquals(result[3], [0]);
  };

  await t.step('findAdjacentMeshlets_Iter', () => {
    const result0 = findAdjacentMeshlets_Iter([
      meshlet0,
      meshlet1,
      meshlet2,
      meshlet3,
    ]);
    // console.log(result0);
    assertResult(result0);
  });

  await t.step('findAdjacentMeshlets_Map', () => {
    const result1 = findAdjacentMeshlets_Map([
      meshlet0,
      meshlet1,
      meshlet2,
      meshlet3,
    ]);
    // console.log(result1);
    assertResult(result1);
  });
});
