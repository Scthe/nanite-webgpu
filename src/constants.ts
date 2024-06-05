const camDist = 1.5;

export const CAMERA_CFG = {
  // pos + rot
  position: [camDist, camDist, camDist],
  target: [0, 1, 0],
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

export const CONFIG = {
  githubRepoLink: 'https://github.com/Scthe/nanite-webgpu',
  clearColor: [0, 0, 0.2],
  rotationSpeed: 1,
  movementSpeed: 2,
  meshScale: 8,
};
