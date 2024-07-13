import {
  binaryFileReader_Web,
  createTextureFromFile_Web,
  textFileReader_Web,
} from './sys_web/loadersWeb.ts';

export const CAMERA_CFG = {
  // pos + rot
  position: {
    position: [1.5, 1.9, 2.3],
    rotation: [-0.6, 0.3], // [pitch, yaw]
    // position: [1.6, 1.9, 1.7],
    // rotation: [-0.8, 0.2], // [pitch, yaw]
  } satisfies CameraOpts,
  // projection
  fovDgr: 45,
  near: 0.01,
  far: 100.0,
};

export type CameraOpts = {
  position?: [number, number, number];
  rotation?: [number, number];
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

// deno-lint-ignore no-window-prefix no-window
export const IS_DENO = window.Deno !== undefined;
export const IS_BROWSER = !IS_DENO;
export const IS_WGPU = IS_DENO;

export const MODELS_DIR = IS_DENO ? 'static/models' : 'models';

export const DEPTH_FORMAT: GPUTextureFormat = 'depth24plus';
export const HDR_RENDER_TEX_FORMAT: GPUTextureFormat = IS_DENO
  ? 'rgba16float' // Cause: "Color state [0] is invalid: Format Rgba32Float is not blendable"
  : 'rgba32float';

/** 4 for Vec4, 3 for Vec3. ATM using Vec3  */
export const CO_PER_VERTEX: number = 3;
/** Give a name to a random magic value '3'. Surely, number of points in a triangle can change someday!  */
export const VERTS_IN_TRIANGLE: number = 3;

export type DisplayMode =
  | 'nanite'
  | 'dbg-lod'
  | 'dbg-lod-meshlets'
  | 'dbg-nanite-meshlets'
  | 'dbg-depth-pyramid';
export type NaniteDevice = 'cpu' | 'gpu';

export const SHADING_MODE_PBR = 0;
export const SHADING_MODE_TRIANGLE = 1;
export const SHADING_MODE_MESHLET = 2;
export const SHADING_MODE_LOD_LEVEL = 3;
export const SHADING_MODE_NORMALS = 4;
export const SHADING_MODE_HW_SW_IMPOSTOR = 5;

export const CONFIG = {
  /** Test env may require GPUBuffers to have extra COPY_* flags to readback results. Or silence console spam. */
  isTest: false,
  /** If we are not rendering the scene but only exporting the LOD hierarchy */
  isExporting: false,
  githubRepoLink: 'https://github.com/Scthe/nanite-webgpu',
  /** This runtime injection prevents loading Deno's libraries like fs, png, etc. */
  loaders: {
    textFileReader: textFileReader_Web,
    binaryFileReader: binaryFileReader_Web,
    createTextureFromFile: createTextureFromFile_Web,
  },

  ///////////////
  /// GENERIC/SCENE STUFF
  /** Changeable from GUI */
  clearColor: [0.2, 0.2, 0.2, 0.0],
  /** Special color: if you need to check for holes */
  clearColorAlt: [0.03, 0.25, 0.4, 0.0],
  /** if you need to check for holes */
  useAlternativeClearColor: false,
  // useAlternativeClearColor: true,
  /** DO NOT CHANGE BEFORE DEFINING THE LIGHT VALUES IN SHADER. WILL CAUSE RNG VALUES OTHERWISE */
  lightsCount: 2,
  /** Feel free to switch on if you want */
  useVertexQuantization: false,
  drawGround: true,

  ///////////////
  /// CAMERA
  /** Camera rotation sensitivity */
  rotationSpeed: 1,
  /** Camera movement sensitivity */
  movementSpeed: 3,
  /** Camera movement sensitivity when pressing SPEED BUTTON */
  movementSpeedFaster: 20,

  ///////////////
  /// DEBUG DISPLAY MODES
  /** Debug display mode to test meshoptimizer */
  displayMode: 'nanite' as DisplayMode,
  /** LOD in 'DBG: lod meshlets' mode */
  dbgMeshoptimizerLodLevel: 0,
  /** LOD in 'DBG: nanite meshlets' mode */
  dbgNaniteLodLevel: 1,
  /** Which depth pyramid level to show in respective debug mode */
  dbgDepthPyramidLevel: 0,

  ///////////////
  /// PostFX-like effects (dither, tonemapping, exposure, gamma etc.)
  colors: {
    gamma: 2.2,
    ditherStrength: 1.0,
    exposure: 0.45,
  },

  ///////////////
  /// CULLING - INSTANCES
  cullingInstances: {
    enabled: true,
    frustumCulling: true,
    occlusionCulling: true,
  },

  ///////////////
  /// BILLBOARD IMPOSTORS
  impostors: {
    views: 12,
    // TODO [RIGHT HERE RIGHT NOW] BRING BACK THE 512px BILLBOARDS CAUSE THEY ARE CUTE
    textureSize: 64,
    /** Every object that is smaller than this on screen becomes impostor billboard.
     * Calculated as `screen space AABB width * height`.
     * This an AABB for an ENTIRE object, not a meshlet!
     */
    billboardThreshold: 4000,
    /** Do not render mesh, ONLY billboards regardless of everything */
    forceOnlyBillboards: false,
    ditherStrength: 0.4,
  },

  ///////////////
  /// CULLING - MESHLETS
  cullingMeshlets: {
    frustumCulling: true,
    occlusionCulling: true,

    /** Software backface cull is not finished, as the gains seem limited. TODO:
     * - handle instances. ATM only every instance assumes it has identity tfx matrix for purpose of culling
     * - fix bugs. Some disappearing triangles at very oblique angles. Just a magic slider to scale condition by 1.1+?
     * - use in GPU visiblity flow
     * - test on dense meshes. Probably works better then
     */
    // useSoftwareBackfaceCull: false,
  },

  ///////////////
  /// SOFTWARE RASTERIZER
  softwareRasterizer: {
    enabled: true,
    /** Every meshlet that is less pixels than this will be software rendered. Calculated as `screen space AABB width * height`. */
    threshold: 1360.0,
  },

  ///////////////
  /// NANITE
  nanite: {
    preprocess: {
      meshletMaxVertices: 64,
      meshletMaxTriangles: 124,
      meshletBackfaceCullingConeWeight: 1.0,
      /** Reduce triangle count per each level. */
      simplificationDecimateFactor: 2,
      /**
       * If you have 100 triangles you expect to simplify into 50. But if the simplification is not possible, you might end up with e.g. 90 triangles (simplification factor 0.9). At this point stop the process for this part of the mesh.
       * > THIS CHECK IS ON PER-MERGED-MESHLETS BASIS.
       *
       * Setting this to >1.0 disables this check.
       */
      simplificationFactorRequirement: 1.1, // 0.97?
      /**
       * If you have 100 triangles you expect to simplify into 50. But if the simplification is not possible, you might end up with e.g. 90 triangles (simplification factor 0.9). At this point stop the ENTIRE process.
       * > THIS CHECK IS DONE BEFORE STARTING NEXT LOD-HIERARCHY-LEVEL.
       *
       * Setting this to >1.0 disables this check.
       */
      simplificationFactorRequirementBetweenLevels: 0.97,
      /** target_error for meshoptimizer */
      simplificationTargetError: 0.05,
      /** Multiplier for 'simplificationTargetError' the higher you go up the LOD tree */
      simplificationTargetErrorMultiplier: 1.1,
      /** We half triangle count each time. Each meshlet is 124 triangles.
       * $2^{MAX_LODS}*124$. E.g. MAX_LODS=15 gives 4M. Vertices above would
       * lead to many top-level tree nodes. Suboptimal, but not incorrect.
       */
      maxLods: 20,
      /** Select algo. to use */
      useMapToFindAdjacentEdges: true,
      /** Go to Devtools->Performance to check Chrome's log */
      enableProfiler: false,
    },
    render: {
      naniteDevice: 'gpu' as NaniteDevice,
      /**
       * If projected error of the LOD is lower then this, then the LOD is rendered.
       * High value -> high acceptable error -> coarse LOD.
       */
      errorThreshold: 0.5,
      /** See cull meshlets pass shader to compare 2 implementations */
      useVisibilityImpl_Iter: true,
      /** Stop updating visbilit buffer (for debug) */
      freezeGPU_Visibilty: false,
      /** Next frame will do an expensive GPU->CPU readback to check content of the GPU 'drawn meshlets' buffer */
      nextFrameDebugDrawnMeshletsBuffer: false,
      shadingMode: SHADING_MODE_PBR,
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

export function isSoftwareRasterizerEnabled() {
  const swr = CONFIG.softwareRasterizer;
  const enabled = swr.enabled;
  const wouldReturnAnything = swr.threshold > 0;

  // Triangle was 1x1 px and now you move camera to make it fullscreen?
  // And by triangle I mean 10+ million triangles.
  const potentiallyDangerous = CONFIG.nanite.render.freezeGPU_Visibilty;

  // require any culling just for stability
  // hardware rasterizing millions of (tiny) triangles is a TERRIBLE idea,
  // but software rasterizing drives Chrome into an.. overdrive.
  const ci = CONFIG.cullingInstances;
  const hasInstanceCull =
    ci.enabled && (ci.frustumCulling || ci.occlusionCulling);
  const cm = CONFIG.cullingMeshlets;
  const hasMshlCull = cm.frustumCulling || cm.occlusionCulling;
  const hasAnyCulling = hasInstanceCull || hasMshlCull;

  return (
    enabled && wouldReturnAnything && !potentiallyDangerous && hasAnyCulling
  );
}
