import { Mat4, mat4 } from 'wgpu-matrix';
import { RenderUniformsBuffer } from './passes/renderUniformsBuffer.ts';
import {
  Dimensions,
  createCameraProjectionMat,
  getViewProjectionMatrix,
} from './utils/index.ts';
import Input from './sys_web/input.ts';
import { CONFIG, DEPTH_FORMAT } from './constants.ts';
import { DrawNanitesPass } from './passes/naniteCpu/drawNanitesPass.ts';
import { Camera } from './camera.ts';
import { PassCtx } from './passes/passCtx.ts';
import { DbgMeshoptimizerPass } from './passes/debug/dbgMeshoptimizerPass.ts';
import { DbgMeshoptimizerMeshletsPass } from './passes/debug/dbgMeshoptimizerMeshletsPass.ts';
import { DrawNaniteGPUPass } from './passes/naniteGpu/drawNaniteGPUPass.ts';
import { NaniteVisibilityPass } from './passes/naniteGpu/naniteVisibilityPass.ts';
import { GpuProfiler } from './gpuProfiler.ts';
import { Scene } from './scene/scene.ts';
import { Frustum } from './utils/frustum.ts';
import { assertIsGPUTextureView } from './utils/webgpu.ts';
import { DepthPyramidPass } from './passes/depthPyramid/depthPyramidPass.ts';
import { DepthPyramidDebugDrawPass } from './passes/depthPyramid/depthPyramidDebugDrawPass.ts';
import { CullInstancesPass } from './passes/cullInstances/cullInstancesPass.ts';

export class Renderer {
  private readonly renderUniformBuffer: RenderUniformsBuffer;
  public readonly cameraCtrl: Camera;
  private readonly cameraFrustum: Frustum = new Frustum();
  private projectionMat: Mat4;
  private readonly _viewMatrix = mat4.identity(); // cached to prevent allocs.
  private depthTexture: GPUTexture = undefined!; // see this.recreateDepthDexture()
  private depthTextureView: GPUTextureView = undefined!; // see this.recreateDepthDexture()
  private frameIdx = 0;

  // passes
  private readonly drawMeshPass: DrawNanitesPass;
  private readonly drawNaniteGPUPass: DrawNaniteGPUPass;
  private readonly naniteVisibilityPass: NaniteVisibilityPass;
  private readonly cullInstancesPass: CullInstancesPass;
  // depth pyramid
  private readonly depthPyramidPass: DepthPyramidPass;
  private readonly depthPyramidDebugDrawPass: DepthPyramidDebugDrawPass;
  // debug
  private readonly dbgMeshoptimizerPass: DbgMeshoptimizerPass;
  private readonly dbgMeshoptimizerMeshletsPass: DbgMeshoptimizerMeshletsPass;

  constructor(
    private readonly device: GPUDevice,
    viewportSize: Dimensions,
    preferredCanvasFormat: GPUTextureFormat,
    private readonly profiler?: GpuProfiler
  ) {
    this.renderUniformBuffer = new RenderUniformsBuffer(device);

    this.drawMeshPass = new DrawNanitesPass(device, preferredCanvasFormat);
    this.drawNaniteGPUPass = new DrawNaniteGPUPass(
      device,
      preferredCanvasFormat
    );
    this.naniteVisibilityPass = new NaniteVisibilityPass(device);
    this.cullInstancesPass = new CullInstancesPass(device);
    this.depthPyramidPass = new DepthPyramidPass(device);
    this.depthPyramidDebugDrawPass = new DepthPyramidDebugDrawPass(
      device,
      preferredCanvasFormat
    );

    // geometry debug passes
    this.dbgMeshoptimizerPass = new DbgMeshoptimizerPass(
      device,
      preferredCanvasFormat,
      this.renderUniformBuffer
    );
    this.dbgMeshoptimizerMeshletsPass = new DbgMeshoptimizerMeshletsPass(
      device,
      preferredCanvasFormat,
      this.renderUniformBuffer
    );

    this.cameraCtrl = new Camera();
    this.projectionMat = createCameraProjectionMat(viewportSize);

    this.recreateDepthDexture(viewportSize);
  }

  updateCamera(deltaTime: number, input: Input): Mat4 {
    this.cameraCtrl.update(deltaTime, input);
  }

  onCanvasResize = (viewportSize: Dimensions) => {
    this.projectionMat = createCameraProjectionMat(viewportSize);

    if (this.depthTexture) {
      this.depthTexture.destroy();
    }
    this.recreateDepthDexture(viewportSize);
  };

  cmdRender(
    cmdBuf: GPUCommandEncoder,
    scene: Scene,
    viewport: Dimensions,
    screenTexture: GPUTextureView
  ) {
    assertIsGPUTextureView(screenTexture);

    const viewMatrix = this.cameraCtrl.viewMatrix;
    const vpMatrix = getViewProjectionMatrix(
      viewMatrix,
      this.projectionMat,
      this._viewMatrix
    );
    this.cameraFrustum.update(vpMatrix);
    const [_depthPyramidTex, _depthPyramidTexView] =
      this.depthPyramidPass.verifyResultTexture(
        this.device,
        this.depthTexture,
        this.depthTextureView
      );
    const ctx: PassCtx = {
      frameIdx: this.frameIdx,
      cmdBuf,
      viewport,
      scene,
      screenTexture,
      device: this.device,
      profiler: this.profiler,
      viewMatrix,
      vpMatrix,
      projMatrix: this.projectionMat,
      cameraFrustum: this.cameraFrustum,
      cameraPositionWorldSpace: this.cameraCtrl.positionWorldSpace,
      depthTexture: this.depthTextureView,
      prevFrameDepthPyramidTexture: _depthPyramidTexView,
      globalUniforms: this.renderUniformBuffer,
      depthPyramidSampler: this.depthPyramidPass.depthSampler,
    };

    this.renderUniformBuffer.update(ctx);

    if (CONFIG.displayMode === 'dbg-lod') {
      this.dbgMeshoptimizerPass.draw(ctx);
    } else if (
      CONFIG.displayMode === 'dbg-lod-meshlets' ||
      CONFIG.displayMode === 'dbg-nanite-meshlets'
    ) {
      this.dbgMeshoptimizerMeshletsPass.draw(ctx);
    } else {
      // draw nanite - calc visibility either CPU or GPU
      if (CONFIG.nanite.render.calcVisibilityDevice === 'gpu') {
        this.cmdDrawNanite_GPU(ctx);
      } else {
        this.cmdDrawNanite_CPU(ctx);
      }
    }

    this.frameIdx += 1;
  }

  private cmdDrawNanite_CPU(ctx: PassCtx) {
    const { naniteObjects } = ctx.scene;

    this.drawMeshPass.initFrameStats();

    // draw objects
    for (let i = 0; i < naniteObjects.length; i++) {
      const naniteObject = naniteObjects[i];
      const loadOp: GPULoadOp = i == 0 ? 'clear' : 'load';

      this.drawMeshPass.draw(ctx, naniteObject, loadOp);
    }

    this.drawMeshPass.uploadFrameStats(ctx);
  }

  private cmdDrawNanite_GPU(ctx: PassCtx) {
    const { naniteObjects } = ctx.scene;

    // draw objects
    for (let i = 0; i < naniteObjects.length; i++) {
      const naniteObject = naniteObjects[i];
      const loadOp: GPULoadOp = i == 0 ? 'clear' : 'load';

      if (!CONFIG.nanite.render.freezeGPU_Visibilty) {
        if (CONFIG.cullingInstances.enabled) {
          this.cullInstancesPass.cmdCullInstances(ctx, naniteObject);
        }
        this.naniteVisibilityPass.cmdCalculateVisibility(ctx, naniteObject);
      }
      this.drawNaniteGPUPass.draw(ctx, naniteObject, loadOp);
    }

    // depth pyramid
    this.depthPyramidPass.cmdCreateDepthPyramid(
      ctx,
      this.depthTexture,
      this.depthTextureView
    );
    CONFIG.nanite.render.hasValidDepthPyramid = true;

    if (CONFIG.displayMode === 'dbg-depth-pyramid') {
      this.depthPyramidDebugDrawPass.cmdDraw(ctx);
    }
  }

  private recreateDepthDexture = (viewportSize: Dimensions) => {
    CONFIG.nanite.render.hasValidDepthPyramid = false;
    if (this.depthTexture) {
      this.depthTexture.destroy();
    }

    this.depthTexture = this.device.createTexture({
      label: `depth-texture-${viewportSize.width}x${viewportSize.height}`,
      size: [viewportSize.width, viewportSize.height],
      format: DEPTH_FORMAT,
      usage:
        GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
    });
    this.depthTextureView = this.depthTexture.createView();

    // reset bindings that used depth texture
    // TODO [LOW] this still has some issues. Add debounce to .onCanvasResize() and render to own color attachment. Then blit to canvas
    this.depthPyramidDebugDrawPass.onDepthTextureResize();
    this.naniteVisibilityPass.onDepthTextureResize();
    this.depthPyramidPass.verifyResultTexture(
      this.device,
      this.depthTexture,
      this.depthTextureView,
      true
    );
  };
}
