import '../lib/metis.d.ts';
import { assertSameArray, injectMetisWASM } from '../sys_deno/testUtils.ts';
import {
  createAdjacencyData,
  partitionGraph,
  partitionGraphImpl,
} from './partitionGraph.ts';
import { assertEquals } from 'assert';

injectMetisWASM();

// prettier-ignore
const XADJ_SECTION_55 = [0, 2, 5, 8, 11, 13, 16, 20, 24, 28, 31, 33, 36, 39, 42, 44];
// prettier-ignore
const ADJNCY_SECTION_55 = [
  1, 5,
  0, 2, 6,
  1, 3, 7,
  2, 4, 8,
  3, 9,
  0, 6, 10, // row 2
  1, 5, 7, 11,
  2, 6, 8, 12,
  3, 7, 9, 13,
  4, 8, 14,
  5, 11, // row 3
  6, 10, 12,
  7, 11, 13,
  8, 12, 14,
  9, 13
];

/** Test that uses graph from metis manual, section 5.5 */
Deno.test('partitionGraph :: Section 5.5 example', async () => {
  const nparts = 2;
  const result = await partitionGraphImpl(
    XADJ_SECTION_55,
    ADJNCY_SECTION_55,
    nparts
  );

  assertEquals(result.length, nparts);
  assertEquals(result[0], [3, 4, 8, 9, 12, 13, 14]);
  assertEquals(result[1], [0, 1, 2, 5, 6, 7, 10, 11]);
});

Deno.test('partitionGraph', async () => {
  const adjacency: number[][] = [];
  const connect = (a: number, b: number) => {
    while (adjacency.length < Math.max(a, b) + 1) {
      adjacency.push([]);
    }
    adjacency[a].push(b);
    adjacency[b].push(a);
  };
  // 1 --- 0 --- 3 ---4
  //  \ 2 /
  connect(0, 1);
  connect(0, 2);
  connect(1, 2); // finish traingle
  connect(0, 3); // from 0 to 'off-branch'
  connect(3, 4); // continue 'off-branch'
  // console.log(adjacency);
  // console.log(createAdjacencyData(adjacency));

  const nparts = 2;
  const result = await partitionGraph(adjacency, nparts);
  // console.log(result);

  assertEquals(result.length, 2);
  assertSameArray(result[0], [3, 4]);
  assertSameArray(result[1], [0, 1, 2]);
});

Deno.test('createAdjacencyData :: Section 5.5 example', () => {
  const data = [
    [1, 5], // 0
    [0, 2, 6], // 1
    [1, 3, 7], // 2
    [2, 4, 8], // 3
    [3, 9], // 4
    [0, 6, 10], // 5
    [1, 5, 7, 11], // 6
    [2, 6, 8, 12], // 7
    [3, 7, 9, 13], // 8
    [4, 8, 14], // 9
    [5, 11], // 10
    [6, 10, 12], // 11
    [7, 11, 13], // 12
    [8, 12, 14], // 13
    [9, 13], // 14
  ];
  const [xadj, adjncy] = createAdjacencyData(data);
  // console.log([xadj, adjncy]);

  assertSameArray(xadj, XADJ_SECTION_55);
  assertSameArray(adjncy, ADJNCY_SECTION_55);
});
