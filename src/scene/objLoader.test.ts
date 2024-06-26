import { absPathFromRepoRoot, assertSameArray } from '../sys_deno/testUtils.ts';
import { loadObjFile } from './objLoader.ts';
import { OVERRIDE_MESHOPTIMIZER_WASM_PATH } from '../meshPreprocessing/meshoptimizerUtils.ts';

const TEST_FILE = 'static/plane.obj';

OVERRIDE_MESHOPTIMIZER_WASM_PATH.value =
  'file:///' + absPathFromRepoRoot('static/meshoptimizer.wasm');

Deno.test('objLoader', async () => {
  const filePath = absPathFromRepoRoot(TEST_FILE);
  let text = Deno.readTextFileSync(filePath);
  text = removeNormalsFromOBJText(text);
  // console.log(text);

  const mesh = await loadObjFile(text, 1.0);
  // console.log(mesh);

  assertSameArray(
    mesh.vertices,
    [
      [1, 1, 1],
      [-1, 1, 1],
      [-1, -1, 1],
      [1, -1, 1],
    ].flat()
  );
  assertSameArray(
    mesh.normals,
    [
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
      [0, 0, 1],
    ].flat()
  );
  assertSameArray(
    mesh.uv,
    [
      [0.5, 0.5],
      [0.5, 0.5],
      [0.5, 0.5],
      [0.5, 0.5],
    ].flat()
  );
  assertSameArray(mesh.indices, [0, 1, 2, 2, 3, 0]);
});

function removeNormalsFromOBJText(text: string) {
  return text
    .split('\n')
    .filter((l) => !l.startsWith('vn'))
    .join('\n');
}
