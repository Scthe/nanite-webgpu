import { ValueOf } from '../utils/index.ts';

export const MODELS_DIR = 'models';

// prettier-ignore
export const OBJECTS = {
  bunny: { file: 'bunny.obj', scale: 8 },
  lucy: { file: 'lucy.obj', scale: 1 },
  dragon: { file: 'xyzrgb_dragon.obj', scale: 0.01 },
  cube: { file: 'cube.obj', scale: 1 },
  plane: { file: 'plane.obj', scale: 1, texture: 'test-texture.png' },
  planeSubdiv: { file: 'plane-subdiv.obj', scale: 0.5 },
  displacedPlane: {
    file: 'displaced-plane.obj',
    scale: 0.2,
    texture: 'test-texture.png',
  },
  // test flat shading - it WILL fail with 'cannot simplify' error.
  displacedPlaneFlat: {
    file: 'displaced-plane-flat.obj',
    scale: 0.2,
    texture: 'test-texture.png',
  },
};
export type SceneObjectName = keyof typeof OBJECTS;

export const SCENES = {
  singleBunny: [sceneModel('bunny', 1, 1)],
  bunny: [sceneModel('bunny')],
  // bunnyRow: [sceneModel('bunny', 1 << 17, 1)],
  bunnyRow: [sceneModel('bunny', 32768, 1)],
  bunny1b: [sceneModel('bunny', 500, 500)],
  bunny1b_dense: [sceneModel('bunny', 500, 500, 0.5)],
  singleLucy: [sceneModel('lucy', 1, 1)],
  // lucy: [sceneModel('lucy', 100, 10, 0)],
  lucy: [sceneModel('lucy', 10, 10, 0)],
  dragon: [sceneModel('dragon', 1, 1)],
  cube: [sceneModel('cube')],
  plane: [sceneModel('plane', 1, 1)],
  planeSubdiv: [sceneModel('planeSubdiv', 1, 1)],
  displacedPlane: [sceneModel('displacedPlane', 1, 1)],
  displacedPlaneFlat: [sceneModel('displacedPlaneFlat', 1, 1)],
  manyObjects: [sceneModel('displacedPlane', 1, 1), sceneModel('bunny', 1, 1)],
};

export type SceneName = keyof typeof SCENES;
export type SceneDesc = ValueOf<typeof SCENES>;

function sceneModel(
  model: SceneObjectName,
  ...args: Parameters<typeof createGrid>
) {
  return { model, instances: createGrid(...args) };
}

export type InstancesGrid = {
  xCnt: number;
  yCnt: number;
  spacing: number;
};
export const getInstancesCount = (g: InstancesGrid) => g.xCnt * g.yCnt;

function createGrid(
  xCnt: number = 10,
  yCnt: number = 10,
  spacing: number = 1.3
): InstancesGrid {
  return {
    xCnt,
    yCnt,
    spacing,
  };
}
