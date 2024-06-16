import { ValueOf } from './utils/index.ts';
import type { CameraOpts } from './camera.ts';

export const CAMERA_CFG = {
  // pos + rot
  position: {
    position: [1.5, 1.9, 2.3],
    rotation: [0.3, -0.6],
  } satisfies CameraOpts,
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
export const BYTES_UVEC2 = BYTES_U32 * 2;
export const BYTES_MAT4 = BYTES_F32 * 16;

export const NANO_TO_MILISECONDS = 0.000001;
export const MILISECONDS_TO_SECONDS = 0.001;

export const DEPTH_FORMAT: GPUTextureFormat = 'depth24plus';

/** 4 for Vec4, 3 for Vec3. ATM using Vec3  */
export const CO_PER_VERTEX: number = 3;
/** Give a name to a random magic value '3'  */
export const VERTS_IN_TRIANGLE: number = 3;

const createGrid = (
  xCnt: number = 10, // 500,
  yCnt: number = 10, // 500,
  offset: number = 1
) => ({
  xCnt,
  yCnt,
  offset,
});

export type InstancesGrid = ReturnType<typeof createGrid>;
export const getInstancesCount = (g: InstancesGrid) => g.xCnt * g.yCnt;

export const SCENES = {
  bunny: { file: 'bunny.obj', scale: 8, grid: createGrid() }, // 500x500 is 1.2b tris
  lucy: { file: 'lucy.obj', scale: 0.001, grid: createGrid(1, 1) },
  dragon: { file: 'xyzrgb_dragon.obj', scale: 1, grid: createGrid(1, 1) },
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
  /** Test env may require GPUBuffers to have extra COPY_* flags to readback results. Or silence console spam. */
  isTest: false,
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
      /** Select algo. to use */
      useMapToFindAdjacentEdges: true,
      /** Go to Devtools->Performance to check Chrome's log */
      enableProfiler: false,
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
      nextFrameDebugVisiblityBuffer: false,
    },
  },
};
