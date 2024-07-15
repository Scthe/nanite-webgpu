# Nanite WebGPU - passes

## Nanite on the CPU

The whole implementation is inside [src/passes/naniteCpu](src/passes/naniteCpu). The implementation does not have advanced culling or impostors. You can always run through it with a debugger.

## Nanite in the GPU

Passes:

1. [CullInstancesPass](src/passes/cullInstances) takes a list of instances and does frustum and occlusion culling. Outputs:
   1. `drawnInstancesBuffer: List<instanceIdx>`.
   2. `drawnImpostorsBuffer: List<instanceIdx>`.
2. [CullMeshletsPass](src/passes/cullMeshlets). For each instance from `drawnInstancesBuffer` check all of the object's meshlets. This includes culling and Nanite LOD condition. Outputs:
   1. Hardware rasterized `List<(instanceIdx, meshletIdx)>`. In the implementation, it's written at the start of `drawnMeshletsBuffer`.
   2. Software rasterized `List<(instanceIdx, meshletIdx)>`. In the implementation, it's written at the end of `drawnMeshletsBuffer`.
3. Rendering.
   1. Hardware rasterize: [RasterizeHwPass](src/passes/rasterizeHw) does a single `drawIndirect()`. Writes into `hdrRenderTexture`.
   2. Software rasterize: [RasterizeSwPass](src/passes/rasterizeHw) does a single `dispatchWorkgroupsIndirect()`. Writes into a u32 per pixel GPUBuffer.
   3. Impostors:  [NaniteBillboardPass](src/passes/naniteBillboard) does a single `drawIndirect()`. Writes into `hdrRenderTexture`.
4. [RasterizeCombinePass](src/passes/rasterizeCombine). Draws a fullscreen triangle to combine all of the rendering techniques into a `hdrRenderTexture`. This could have been a compute shader, but WebGPU objects.
5. [DrawGroundPass](src/passes/drawGroundPass.ts). Prevents depth discontinuities.
6. [DepthPyramidPass](src/passes/depthPyramid) creates a depth pyramid from the depth buffer for occlusion culling.
7. [PresentPass](src/passes/presentPass). Dither, exposure, tonemapping, gamma.

