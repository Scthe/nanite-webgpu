import type { CameraOpts } from './camera.ts';

export const CAMERA_CFG = {
  // pos + rot
  position: {
    position: [1.5, 1.9, 2.3],
    rotation: [-0.6, 0.3], // [pitch, yaw]
    // position: [1.2, 0.8, 0.2],
    // rotation: [-1.4, 0.1], // [pitch, yaw]
  } satisfies CameraOpts,
  // projection
  fovDgr: 45,
  near: 0.01,
  far: 100.0,
};

export const BYTES_U8 = 1;
export const BYTES_F32 = 4;
export const BYTES_U32 = 4;
export const BYTES_U64 = 8;
export const BYTES_VEC2 = BYTES_F32 * 2;
export const BYTES_VEC3 = BYTES_F32 * 3;
export const BYTES_VEC4 = BYTES_F32 * 4;
export const BYTES_UVEC2 = BYTES_U32 * 2;
export const BYTES_UVEC4 = BYTES_U32 * 4;
export const BYTES_U8_VEC4 = BYTES_U8 * 4;
export const BYTES_MAT4 = BYTES_F32 * 16;

export const NANO_TO_MILISECONDS = 0.000001;
export const MILISECONDS_TO_SECONDS = 0.001;

export const DEPTH_FORMAT: GPUTextureFormat = 'depth24plus';

/** 4 for Vec4, 3 for Vec3. ATM using Vec3  */
export const CO_PER_VERTEX: number = 3;
/** Give a name to a random magic value '3'  */
export const VERTS_IN_TRIANGLE: number = 3;

export type DisplayMode =
  | 'nanite'
  | 'dbg-lod'
  | 'dbg-lod-meshlets'
  | 'dbg-nanite-meshlets'
  | 'dbg-depth-pyramid';
export type CalcVisibilityDevice = 'cpu' | 'gpu';

export const SHADING_MODE_PBR = 0;
export const SHADING_MODE_TRIANGLE = 1;
export const SHADING_MODE_MESHLET = 2;
export const SHADING_MODE_LOD_LEVEL = 3;
export const SHADING_MODE_NORMALS = 4;

export const CONFIG = {
  /** Test env may require GPUBuffers to have extra COPY_* flags to readback results. Or silence console spam. */
  isTest: false,
  githubRepoLink: 'https://github.com/Scthe/nanite-webgpu',
  clearColor: [0.2, 0.2, 0.2],
  clearColorAlt: [0.35, 0.35, 0.8], // if you need to check for holes
  useAlternativeClearColor: false,
  rotationSpeed: 1,
  movementSpeed: 3,
  movementSpeedFaster: 20,
  displayMode: 'nanite' as DisplayMode,
  dbgMeshoptimizerLodLevel: 0,
  dbgDepthPyramidLevel: 0,
  dbgNaniteLodLevel: 1,
  lightsCount: 2,
  nanite: {
    preprocess: {
      meshletMaxVertices: 64,
      meshletMaxTriangles: 124,
      meshletBackfaceCullingConeWeight: 1.0,
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
      /** See visiblity pass shader to compare 2 implementations */
      useVisibilityImpl_Iter: true,
      /** Stop updating visbilit buffer (for debug) */
      freezeGPU_Visibilty: false,
      /** Next frame will do an expensive GPU->CPU readback to check GPU visibility buffer */
      nextFrameDebugVisiblityBuffer: false,
      shadingMode: SHADING_MODE_PBR,

      //////////////////////////
      // Culling
      /** Software backface cull is not finished, as the gains seem limited. TODO:
       * - handle instances. ATM only every instance assumes it has identity tfx matrix for purpose of culling
       * - fix bugs. Some disappearing triangles at very oblique angles. Just a magic slider to scale condition by 1.1+?
       * - use in GPU visiblity flow
       * - test on dense meshes. Probably works better then
       */
      useFrustumCulling: true,
      // useSoftwareBackfaceCull: false,
      useOcclusionCulling: true,
      isOverrideOcclusionCullMipmap: false,
      occlusionCullOverrideMipmapLevel: 0,
      /** Need 1st render first! */
      hasValidDepthPyramid: false,
      /** Hardware cull should be 'back'. Yet if some model has wrong winding
       * I would refuse to spend hours debugging thinking it's a disappearing meshlet.
       * Just use normal 3D software?
       */
      allowHardwareBackfaceCull: true,
    },
  },
};
