import { Mat4 } from 'wgpu-matrix';

import { RenderUniformsBuffer } from './passes/renderUniformsBuffer.ts';
import {
  Dimensions,
  createCameraProjectionMat,
  getModelViewProjectionMatrix,
} from './utils/index.ts';
import Input from './sys_web/input.ts';
import { CAMERA_CFG, DEPTH_FORMAT } from './constants.ts';
import { DrawMeshPass } from './passes/drawMeshPass.ts';
import { Camera } from './camera.ts';
import { PassCtx } from './passes/passCtx.ts';

export interface ShadersTexts {
  drawMeshShader: string;
}

/** Web and Deno handle files differently. A bit awkward but good enough. */
export function injectShaderTexts(texts: ShadersTexts) {
  DrawMeshPass.SHADER_CODE = texts.drawMeshShader;
}

export class Renderer {
  private readonly renderUniformBuffer: RenderUniformsBuffer;
  private readonly cameraCtrl: Camera;
  private projectionMat: Mat4;
  private depthTexture: GPUTexture;

  // passes
  private readonly drawMeshPass: DrawMeshPass;

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

    this.cameraCtrl = new Camera(CAMERA_CFG);
    this.projectionMat = createCameraProjectionMat(viewportSize);

    this.depthTexture = this.createDepthDexture(viewportSize);
  }

  updateCamera(deltaTime: number, input: Input): Mat4 {
    this.cameraCtrl.update(deltaTime, input);
  }

  onCanvasResize = (viewportSize: Dimensions) => {
    this.projectionMat = createCameraProjectionMat(viewportSize);

    if (this.depthTexture) {
      this.depthTexture.destroy();
    }
    this.depthTexture = this.createDepthDexture(viewportSize);
  };

  cmdRender(
    _ctx: Pick<PassCtx, 'device' | 'cmdBuf' | 'profiler' | 'viewport' | 'mesh'>,
    targetTexture: GPUTexture
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
      depthTexture: this.depthTexture,
    };

    this.renderUniformBuffer.update(ctx);
    this.drawMeshPass.draw(ctx, targetTexture, 'load');
  }

  private createDepthDexture = (viewportSize: Dimensions) =>
    this.device.createTexture({
      size: [viewportSize.width, viewportSize.height],
      format: DEPTH_FORMAT,
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
}
