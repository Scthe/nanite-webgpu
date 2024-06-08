import { Mat4 } from 'wgpu-matrix';

import { RenderUniformsBuffer } from './passes/renderUniformsBuffer.ts';
import {
  Dimensions,
  createCameraProjectionMat,
  getModelViewProjectionMatrix,
} from './utils/index.ts';
import Input from './sys_web/input.ts';
import { CAMERA_CFG, CONFIG, DEPTH_FORMAT } from './constants.ts';
import { DrawMeshPass } from './passes/drawMeshPass.ts';
import { Camera } from './camera.ts';
import { PassCtx } from './passes/passCtx.ts';
import { DbgMeshoptimizerPass } from './passes/dbgMeshoptimizerPass.ts';
import { DbgMeshoptimizerMeshletsPass } from './passes/dbgMeshoptimizerMeshletsPass.ts';

export interface ShadersTexts {
  drawMeshShader: string;
  dbgMeshoptimizerShader: string;
  dbgMeshoptimizerMeshletsShader: string;
}

/** Web and Deno handle files differently. A bit awkward but good enough. */
export function injectShaderTexts(texts: ShadersTexts) {
  DrawMeshPass.SHADER_CODE = texts.drawMeshShader;
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
  private readonly drawMeshPass: DrawMeshPass;
  private readonly dbgMeshoptimizerPass: DbgMeshoptimizerPass;
  private readonly dbgMeshoptimizerMeshletsPass: DbgMeshoptimizerMeshletsPass;

  constructor(
    private readonly device: GPUDevice,
    viewportSize: Dimensions,
    preferredCanvasFormat: GPUTextureFormat
  ) {
    this.renderUniformBuffer = new RenderUniformsBuffer(device);

    this.drawMeshPass = new DrawMeshPass(
      device,
      preferredCanvasFormat,
      this.renderUniformBuffer
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
    const mvpMatrix = getModelViewProjectionMatrix(
      viewMatrix,
      this.projectionMat
    );
    const ctx: PassCtx = {
      ..._ctx,
      viewMatrix,
      mvpMatrix,
      projMatrix: this.projectionMat,
      depthTexture: this.depthTextureView,
    };

    this.renderUniformBuffer.update(ctx);

    if (CONFIG.displayMode === 'dbg-lod') {
      this.dbgMeshoptimizerPass.draw(ctx, 'load');
    } else if (
      CONFIG.displayMode === 'dbg-lod-meshlets' ||
      CONFIG.displayMode === 'dbg-nanite-meshlets'
    ) {
      this.dbgMeshoptimizerMeshletsPass.draw(ctx, 'load');
    } else {
      this.drawMeshPass.draw(ctx, 'load');
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
