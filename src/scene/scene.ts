import { meshopt_Meshlets } from '../meshPreprocessing/createMeshlets.types.ts';
import { GPUOriginalMesh } from './GPUOriginalMesh.ts';
import { NaniteObject } from './naniteObject.ts';

export interface Scene {
  naniteObjects: NaniteObject[];
  debugMeshes: DebugMeshes;
  fallbackDiffuseTexture: GPUTexture;
  /** Texture with neutral (probably grey) color */
  fallbackDiffuseTextureView: GPUTextureView;
  samplerNearest: GPUSampler;
  samplerLinear: GPUSampler;

  // stats
  /** Triangle count as imported from .OBJ file. This is how much you would render if you did not have nanite */
  naiveTriangleCount: number;
  /** Bottom-level meshlets. We don't want to render them, we want something higher-up the LOD tree to reduce triangle count */
  naiveMeshletCount: number;
  /** Sum of instance count over all objects */
  totalInstancesCount: number;
}

export function getDebugTestObject(scene: Scene): [DebugMeshes, NaniteObject] {
  return [scene.debugMeshes, scene.naniteObjects[0]];
}

export const getDiffuseTexture = (scene: Scene, naniteObject: NaniteObject) =>
  naniteObject.diffuseTextureView || scene.fallbackDiffuseTextureView;

export interface DebugMeshes {
  mesh: GPUOriginalMesh;
  meshlets: MeshletRenderPckg;
  meshoptimizerLODs: GPUOriginalMesh[];
  meshoptimizerMeshletLODs: MeshletRenderPckg[];
}

/** Used only in debug */
export type MeshletRenderPckg = meshopt_Meshlets & {
  vertexBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
};
