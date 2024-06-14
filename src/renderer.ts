import { Mat4 } from 'wgpu-matrix';

import { RenderUniformsBuffer } from './passes/renderUniformsBuffer.ts';
import {
  Dimensions,
  createCameraProjectionMat,
  getViewProjectionMatrix,
} from './utils/index.ts';
import Input from './sys_web/input.ts';
import { CAMERA_CFG, CONFIG, DEPTH_FORMAT } from './constants.ts';
import { DrawNanitesPass } from './passes/naniteCpu/drawNanitesPass.ts';
import { Camera } from './camera.ts';
import { PassCtx } from './passes/passCtx.ts';
import { DbgMeshoptimizerPass } from './passes/debug/dbgMeshoptimizerPass.ts';
import { DbgMeshoptimizerMeshletsPass } from './passes/debug/dbgMeshoptimizerMeshletsPass.ts';
import { Scene } from './scene/types.ts';
import { DrawNaniteGPUPass } from './passes/naniteGpu/drawNaniteGPUPass.ts';
import { NaniteVisibilityPass } from './passes/naniteGpu/naniteVisibilityPass.ts';

export interface ShadersTexts {
  drawMeshShader: string;
  drawNaniteGPUShader: string;
  naniteVisibilityGPUShader: string;
  dbgMeshoptimizerShader: string;
  dbgMeshoptimizerMeshletsShader: string;
}

/** Web and Deno handle files differently. A bit awkward but good enough. */
export function injectShaderTexts(texts: ShadersTexts) {
  DrawNanitesPass.SHADER_CODE = texts.drawMeshShader;
  DrawNaniteGPUPass.SHADER_CODE = texts.drawNaniteGPUShader;
  NaniteVisibilityPass.SHADER_CODE = texts.naniteVisibilityGPUShader;
  DbgMeshoptimizerPass.SHADER_CODE = texts.dbgMeshoptimizerShader;
  DbgMeshoptimizerMeshletsPass.SHADER_CODE =
    texts.dbgMeshoptimizerMeshletsShader;
}

export class Renderer {
  private readonly renderUniformBuffer: RenderUniformsBuffer;
  private readonly cameraCtrl: Camera;
  private projectionMat: Mat4;
  private depthTexture: GPUTexture = undefined!; // see this.recreateDepthDexture()
  private depthTextureView: GPUTextureView = undefined!; // see this.recreateDepthDexture()

  // passes
  private readonly drawMeshPass: DrawNanitesPass;
  private readonly drawNaniteGPUPass: DrawNaniteGPUPass;
  private readonly naniteVisibilityPass: NaniteVisibilityPass;
  private readonly dbgMeshoptimizerPass: DbgMeshoptimizerPass;
  private readonly dbgMeshoptimizerMeshletsPass: DbgMeshoptimizerMeshletsPass;

  constructor(
    private readonly device: GPUDevice,
    viewportSize: Dimensions,
    preferredCanvasFormat: GPUTextureFormat,
    scene: Scene
  ) {
    this.renderUniformBuffer = new RenderUniformsBuffer(device);

    this.drawMeshPass = new DrawNanitesPass(
      device,
      preferredCanvasFormat,
      this.renderUniformBuffer,
      scene.naniteObject
    );
    this.drawNaniteGPUPass = new DrawNaniteGPUPass(
      device,
      preferredCanvasFormat,
      this.renderUniformBuffer,
      scene.naniteObject
    );
    this.naniteVisibilityPass = new NaniteVisibilityPass(
      device,
      this.renderUniformBuffer,
      scene.naniteObject
    );
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

    this.cameraCtrl = new Camera(CAMERA_CFG);
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
    _ctx: Pick<
      PassCtx,
      'device' | 'cmdBuf' | 'profiler' | 'viewport' | 'scene' | 'screenTexture'
    >
  ) {
    const viewMatrix = this.cameraCtrl.viewMatrix;
    const vpMatrix = getViewProjectionMatrix(viewMatrix, this.projectionMat);
    const ctx: PassCtx = {
      ..._ctx,
      viewMatrix,
      vpMatrix,
      projMatrix: this.projectionMat,
      depthTexture: this.depthTextureView,
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
      if (CONFIG.nanite.render.calcVisibilityDevice === 'gpu') {
        const { naniteObject } = ctx.scene;
        this.naniteVisibilityPass.cmdCalculateVisibility(ctx, naniteObject);
        this.drawNaniteGPUPass.draw(ctx, naniteObject);
      } else {
        this.drawMeshPass.draw(ctx);
      }
    }
  }

  private recreateDepthDexture = (viewportSize: Dimensions) => {
    if (this.depthTexture) {
      this.depthTexture.destroy();
    }

    this.depthTexture = this.device.createTexture({
      label: 'depth-texture',
      size: [viewportSize.width, viewportSize.height],
      format: DEPTH_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTextureView = this.depthTexture.createView();
  };
}
