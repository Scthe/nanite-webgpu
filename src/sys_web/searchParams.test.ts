// deno-lint-ignore-file no-explicit-any
import { assertEquals } from 'assert';
import { deepMerge } from 'deep-merge';
import { SCENES, SceneName } from '../scene/sceneFiles.ts';
import { INVALID_SEARCH_PARAMS, applySearchParams } from './searchParams.ts';
import { CONFIG } from '../constants.ts';
import { absPathFromRepoRoot } from '../sys_deno/testUtils.ts';

const DEFAULT_SCENE: SceneName = 'TEST_DEFAULT_SCENE' as any;

Deno.test('searchParams()', async (t) => {
  CONFIG.isTest = true;

  const testSearchParams = (
    queryParams: string,
    expectedSceneName: string | undefined,
    changes: any,
    invalidParamsLen = 0
  ) => {
    return t.step(`Should parse '${queryParams}'`, () => {
      INVALID_SEARCH_PARAMS.splice(0, INVALID_SEARCH_PARAMS.length); // clear
      globalThis.window.location = { search: queryParams } as any;
      const modifiedConfig = createMockConfig();

      const actualSceneName = applySearchParams(modifiedConfig, DEFAULT_SCENE);

      expectedSceneName = expectedSceneName || DEFAULT_SCENE;
      assertEquals(actualSceneName, expectedSceneName);

      const expectedConfig = deepMerge(createMockConfig(), changes) as any;
      assertEquals(modifiedConfig, expectedConfig);
      assertEquals(INVALID_SEARCH_PARAMS.length, invalidParamsLen);
    });
  };

  /** Search params that do nothing */
  const testNoopSearchParams = async (params: string[]) => {
    for (const queryParams of params) {
      await testSearchParams(queryParams, undefined, {});
    }
  };

  // empty etc.
  await testSearchParams('', undefined, {});
  await testSearchParams('?', undefined, {});
  await testSearchParams('?a=1', undefined, {}, 1);

  // scene file
  const sceneName0 = Object.keys(SCENES)[0];
  const sceneName1 = Object.keys(SCENES)[1];
  await testSearchParams(`?scene_file=${sceneName0}`, sceneName0, {});
  await testSearchParams(`?scene_file=${sceneName1}`, sceneName1, {});
  await testSearchParams(`?scene_file=INVALID_SCENE_NAME`, undefined, {});

  // softwareRasterizerThreshold
  await testSearchParams('?softwarerasterizer_threshold=0', undefined, {
    softwareRasterizer: { enabled: false },
  });
  await testSearchParams('?softwarerasterizer_threshold=0.1', undefined, {
    softwareRasterizer: { threshold: 0.1 },
  });
  await testSearchParams('?softwarerasterizer_threshold=-0.1', undefined, {
    softwareRasterizer: { threshold: 0.1 },
  });
  await testNoopSearchParams([
    '?softwarerasterizer_threshold=INFINITY',
    '?softwarerasterizer_threshold=-INFINITY',
    '?softwarerasterizer_threshold=NaN',
    '?softwarerasterizer_threshold=whatever',
    '?softwarerasterizer_threshold=???',
  ]);

  // impostorsThreshold
  await testSearchParams('?impostors_threshold=0.1', undefined, {
    impostors: { billboardThreshold: 0.1 },
  });
  await testSearchParams('?impostors_threshold=-0.1', undefined, {
    impostors: { billboardThreshold: 0.1 },
  });
  await testNoopSearchParams([
    '?impostors_threshold=INFINITY',
    '?impostors_threshold=-INFINITY',
    '?impostors_threshold=NaN',
    '?impostors_threshold=whatever',
    '?impostors_threshold=???',
  ]);

  // impostorsThreshold
  await testSearchParams('?impostors_texturesize=0.1', undefined, {
    impostors: { textureSize: 0.1 },
  });
  await testSearchParams('?impostors_texturesize=-0.1', undefined, {
    impostors: { textureSize: 0.1 },
  });
  await testNoopSearchParams([
    '?impostors_texturesize=INFINITY',
    '?impostors_texturesize=-INFINITY',
    '?impostors_texturesize=NaN',
    '?impostors_texturesize=whatever',
    '?impostors_texturesize=???',
  ]);

  // naniteErrorThreshold
  await testSearchParams('?nanite_errorthreshold=0.1', undefined, {
    nanite: { render: { errorThreshold: 0.1 } },
  });
  await testSearchParams('?nanite_errorthreshold=-0.1', undefined, {
    nanite: { render: { errorThreshold: 0.1 } },
  });
  await testNoopSearchParams([
    '?nanite_errorthreshold=INFINITY',
    '?nanite_errorthreshold=-INFINITY',
    '?nanite_errorthreshold=NaN',
    '?nanite_errorthreshold=whatever',
    '?nanite_errorthreshold=???',
  ]);

  // impostorsForceOnlyBillboards
  await testSearchParams('?impostors_forceOnlyBillboards', undefined, {
    impostors: { forceOnlyBillboards: true },
  });
  await testSearchParams('?IMPOSTORS_FORCEONLYBILLBOARDS', undefined, {
    impostors: { forceOnlyBillboards: true },
  });
});

Deno.test('searchParams() from README.md', async (t) => {
  CONFIG.isTest = true;

  const LINK_REGEX = new RegExp(`${CONFIG.githubDemoLink}.*?\\)`, 'g');
  const readmeText = Deno.readTextFileSync(absPathFromRepoRoot('README.md'));

  const linkMatches = [...readmeText.matchAll(LINK_REGEX)];
  assertEquals(linkMatches.length, 11);

  for (let i = 0; i < linkMatches.length; i++) {
    let link = linkMatches[i][0];
    link = link.endsWith(')') ? link.substring(0, link.length - 1) : link;
    const queryParams = link.substring(link.indexOf('?'));

    await t.step(`Readme link '${link}'`, () => {
      INVALID_SEARCH_PARAMS.splice(0, INVALID_SEARCH_PARAMS.length); // clear
      globalThis.window.location = { search: queryParams } as any;
      const modifiedConfig = createMockConfig();

      applySearchParams(modifiedConfig, DEFAULT_SCENE);

      // check there are no typos
      assertEquals(INVALID_SEARCH_PARAMS.length, 0);
    });
  }
});

function createMockConfig(): typeof CONFIG {
  return {
    softwareRasterizer: {
      ...CONFIG.softwareRasterizer,
    },
    impostors: {
      ...CONFIG.impostors,
    },
    nanite: {
      render: {},
    },
  } as any;
}
