import { ValueOf } from './utils/index.ts';

export const CAMERA_CFG = {
  // pos + rot
  position: [1.5, 1.9, 2.3],
  rotation: [0.3, -0.6],
  // projection
  fovDgr: 45,
  near: 0.01,
  far: 100,
};

export const BYTES_U8 = 1;
export const BYTES_F32 = 4;
export const BYTES_U32 = 4;
export const BYTES_U64 = 8;
export const BYTES_VEC3 = BYTES_F32 * 3;
export const BYTES_VEC4 = BYTES_F32 * 4;
export const BYTES_MAT4 = BYTES_F32 * 16;

export const DEPTH_FORMAT: GPUTextureFormat = 'depth24plus';

/** 4 for Vec4, 3 for Vec3. ATM using Vec3  */
export const CO_PER_VERTEX: number = 3;
/** Give a name to a random magic value '3'  */
export const VERTS_IN_TRIANGLE: number = 3;

const createGrid = (
  xCnt: number = 10,
  yCnt: number = 10,
  offset: number = 1
) => ({
  xCnt,
  yCnt,
  offset,
});

export const SCENES = {
  bunny: { file: 'bunny.obj', scale: 8, grid: createGrid() },
  cube: { file: 'cube.obj', scale: 1, grid: createGrid() },
  plane: { file: 'plane.obj', scale: 1, grid: createGrid() },
  displacedPlane: {
    file: 'displaced-plane.obj',
    scale: 0.2,
    grid: createGrid(),
  },
};
export type SceneFile = keyof typeof SCENES;
export type SceneDesc = ValueOf<typeof SCENES>;

export type DisplayMode =
  | 'nanite'
  | 'dbg-lod'
  | 'dbg-lod-meshlets'
  | 'dbg-nanite-meshlets';
export type CalcVisibilityDevice = 'cpu' | 'gpu';

export const CONFIG = {
  githubRepoLink: 'https://github.com/Scthe/nanite-webgpu',
  clearColor: [0.2, 0.2, 0.2],
  rotationSpeed: 1,
  movementSpeed: 3,
  movementSpeedFaster: 20,
  displayMode: 'nanite' as DisplayMode,
  dbgMeshoptimizerLodLevel: 0,
  dbgNaniteLodLevel: 1,
  nanite: {
    preprocess: {
      meshletMaxVertices: 64,
      meshletMaxTriangles: 124,
    },
    render: {
      calcVisibilityDevice: 'gpu' as CalcVisibilityDevice,
      /**
       * If projected error of the LOD is lower then this, then the LOD is rendered.
       * High value -> high acceptable error -> coarse LOD.
       *
       * In pixels.
       */
      pixelThreshold: 1.0,
    },
  },
};

export const STATS: Record<string, number | string> = {};
