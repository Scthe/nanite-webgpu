import { ValueOf } from '../utils/index.ts';

export const OBJECTS = {
  bunny: { file: 'bunny.obj', scale: 8 },
  lucy: { file: 'lucy.obj', scale: 1 },
  dragon: { file: 'xyzrgb_dragon.obj', scale: 1 },
  cube: { file: 'cube.obj', scale: 1 },
  plane: { file: 'plane.obj', scale: 1 },
  displacedPlane: {
    file: 'displaced-plane.obj',
    scale: 0.2,
  },
};
export type SceneObjectName = keyof typeof OBJECTS;

export const SCENES = {
  singleBunny: [sceneModel('bunny', 1, 1)],
  bunny: [sceneModel('bunny')],
  bunny1b: [sceneModel('bunny', 500, 500)],
  bunny1b_dense: [sceneModel('bunny', 500, 500, 0.5)],
  lucy: [sceneModel('lucy', 1, 1)],
  dragon: [sceneModel('dragon', 1, 1)],
  cube: [sceneModel('cube')],
  plane: [sceneModel('plane', 1, 1)],
  displacedPlane: [sceneModel('displacedPlane', 1, 1)],
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
  offset: number;
};
export const getInstancesCount = (g: InstancesGrid) => g.xCnt * g.yCnt;

function createGrid(
  xCnt: number = 10,
  yCnt: number = 10,
  offset: number = 1.3
): InstancesGrid {
  return {
    xCnt,
    yCnt,
    offset,
  };
}
