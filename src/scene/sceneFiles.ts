import { ValueOf } from '../utils/index.ts';
import { InstancesGridDef, createGrid } from './instancesData.ts';

export const MODELS_DIR = 'models';

// prettier-ignore
export const OBJECTS = {
  bunny: { file: 'bunny.obj', scale: 8 },
  lucy: { file: 'lucy.obj', scale: 1 },
  lucyJson: { file: 'lucy.json', scale: 1 },
  dragon: { file: 'xyzrgb_dragon.obj', scale: 0.01 },
  dragonJson: { file: 'dragon.json', scale: 0.01 },
  cube: { file: 'cube.obj', scale: 1 },
  plane: { file: 'plane.obj', scale: 1, texture: 'test-texture.png' },
  planeSubdiv: { file: 'plane-subdiv.obj', scale: 0.5 },
  displacedPlane: {
    file: 'displaced-plane.obj',
    scale: 0.2,
    texture: 'test-texture.png',
  },
  // test flat shading - it WILL fail with 'cannot simplify' error.
  displacedPlaneFlat: { file: 'displaced-plane-flat.obj', scale: 0.2 },
  // jinx
  jinxBackpack: { file: 'jinx/jinx_backpack.obj', scale: 1, texture: 'jinx/jinx_backpack.png' },
  jinxBody: { file: 'jinx/jinx_body.obj', scale: 1, texture: 'jinx/jinx_body.png' },
  jinxFace: { file: 'jinx/jinx_face.obj', scale: 1, texture: 'jinx/jinx_face.png' },
  jinxHair: { file: 'jinx/jinx_hair.obj', scale: 1, texture: 'jinx/jinx_hair.png' },
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
  singleLucyJson: [sceneModel('lucyJson', 1, 1)],
  lucy: [sceneModel('lucy', 10, 10, 0)],
  dragon: [sceneModel('dragon', 1, 1)],
  dragonJson: [sceneModel('dragonJson', 1, 1)],
  cube: [sceneModel('cube', 1, 1)],
  plane: [sceneModel('plane', 1, 1)],
  planeSubdiv: [sceneModel('planeSubdiv', 1, 1)],
  displacedPlane: [sceneModel('displacedPlane', 1, 1)],
  displacedPlaneFlat: [sceneModel('displacedPlaneFlat', 1, 1)],
  manyObjects: [
    sceneModelUniformGrid('displacedPlane', 10, 2, 0),
    sceneModelUniformGrid('bunny', 10, 2, 1),
  ],
  jinx: {
    models: [
      'jinxBody',
      'jinxFace',
      'jinxHair',
      'jinxBackpack',
    ] as SceneObjectName[],
    instances: createGrid(100, 100, 1.0),
  },
};

export type SceneName = keyof typeof SCENES;
export type SceneDesc = ValueOf<typeof SCENES>;

function sceneModel(
  model: SceneObjectName,
  ...args: Parameters<typeof createGrid>
) {
  const instances = createGrid(...args);
  return obj(model, instances);
}

function sceneModelUniformGrid(
  model: SceneObjectName,
  count: number,
  spacing: number,
  offset = 0
) {
  const instances = createGrid(count, count, spacing, offset, offset);
  return obj(model, instances);
}

function obj(model: SceneObjectName, instances: InstancesGridDef) {
  return { model, instances };
}

export function isValidSceneName(scName: unknown): scName is SceneName {
  return typeof scName === 'string' && Object.keys(SCENES).includes(scName);
}
