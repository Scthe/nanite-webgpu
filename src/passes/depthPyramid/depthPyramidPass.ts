import {
  assertIsGPUTextureView,
  getItemsPerThread,
} from '../../utils/webgpu.ts';
import {
  labelShader,
  labelPipeline,
  assignResourcesToBindings2,
  createLabel,
} from '../_shared.ts';
import { SHADER_PARAMS, SHADER_CODE } from './depthPyramidPass.wgsl.ts';
import { PassCtx } from '../passCtx.ts';

interface PyramidLevel {
  level: number;
  textureView: GPUTextureView;
  bindings: GPUBindGroup;
  width: number;
  height: number;
}

const getMipSize = (d: number) => Math.floor(d / 2);

export class DepthPyramidPass {
  public static NAME: string = DepthPyramidPass.name;

  private readonly pipeline: GPUComputePipeline;
  private resultTexture: GPUTexture | undefined = undefined;
  private resultTextureView: GPUTextureView | undefined = undefined;

  /**
   * - 0 - downscaled 2x,
   * - 1 - downscaled 4x, etc. */
  public pyramidLevels: PyramidLevel[] = [];

  constructor(device: GPUDevice) {
    this.pipeline = DepthPyramidPass.createPipeline(device);
  }

  private static createPipeline(device: GPUDevice) {
    const shaderModule = device.createShaderModule({
      label: labelShader(DepthPyramidPass),
      code: SHADER_CODE(),
    });
    return device.createComputePipeline({
      label: labelPipeline(DepthPyramidPass),
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  /** Conditionally refreshes the result texture based on source dimensions. */
  verifyResultTexture(
    device: GPUDevice,
    textureSrc: GPUTexture,
    textureSrcView: GPUTextureView,
    forceRecreate: boolean = false
  ): [GPUTexture, GPUTextureView] {
    assertIsGPUTextureView(textureSrcView);
    const dstW = getMipSize(textureSrc.width);
    const dstH = getMipSize(textureSrc.height);

    // check if existing is good enough
    if (
      this.resultTexture?.width === dstW &&
      this.resultTexture?.height === dstH &&
      this.pyramidLevels.length > 0 &&
      this.resultTextureView != undefined &&
      !forceRecreate
    ) {
      return [this.resultTexture, this.resultTextureView];
    }

    // create a new texture
    if (this.resultTexture) {
      this.resultTexture.destroy();
    }

    const mipLevelCount = Math.ceil(Math.log2(Math.min(dstW, dstH)));
    console.log(`${DepthPyramidPass.NAME}: Create depth pyramid: ${dstW}x${dstH} with ${mipLevelCount} mip levels`); // prettier-ignore

    this.resultTexture = device.createTexture({
      label: createLabel(DepthPyramidPass, `result-${dstW}-${dstH}`),
      dimension: '2d',
      size: [dstW, dstH, 1],
      format: 'r32float',
      usage:
        GPUTextureUsage.COPY_SRC |
        GPUTextureUsage.STORAGE_BINDING |
        GPUTextureUsage.TEXTURE_BINDING,
      mipLevelCount,
    });
    this.resultTextureView = this.resultTexture.createView();

    // create mipmaps
    this.pyramidLevels = [];
    let minWidth = dstW;
    let mipHeight = dstH;
    let prevLevelTexView = textureSrcView;

    for (let baseMipLevel = 0; baseMipLevel < mipLevelCount; baseMipLevel++) {
      const textureView = this.resultTexture.createView({
        label: createLabel(DepthPyramidPass, `mip-${baseMipLevel}`),
        baseMipLevel,
        mipLevelCount: 1,
      });
      const bindings = this.createBindings(
        device,
        `mip-${baseMipLevel}`,
        prevLevelTexView,
        textureView
      );

      this.pyramidLevels.push({
        level: baseMipLevel,
        textureView,
        bindings,
        width: minWidth,
        height: mipHeight,
      });
      // console.log('Depth pyramid level', this.pyramidLevels.at(-1));

      // prepare next iter
      prevLevelTexView = textureView;
      minWidth = getMipSize(minWidth);
      mipHeight = getMipSize(mipHeight);
    }

    return [this.resultTexture, this.resultTextureView];
  }

  cmdCreateDepthPyramid(
    ctx: PassCtx,
    textureSrc: GPUTexture,
    textureSrcView: GPUTextureView
  ) {
    const { cmdBuf, profiler } = ctx;
    assertIsGPUTextureView(textureSrcView);

    this.verifyResultTexture(ctx.device, textureSrc, textureSrcView);

    // no need to clear previous values, as we override every pixel
    const computePass = cmdBuf.beginComputePass({
      timestampWrites: profiler?.createScopeGpu(DepthPyramidPass.NAME),
    });

    computePass.setPipeline(this.pipeline);

    this.pyramidLevels.forEach((level) =>
      this.dispatchPyramidLevel(computePass, level)
    );

    computePass.end();
  }

  private dispatchPyramidLevel(
    computePass: GPUComputePassEncoder,
    level: PyramidLevel
  ) {
    computePass.setBindGroup(0, level.bindings);

    // dispatch params
    const workgroupsCntX = getItemsPerThread(
      level.width,
      SHADER_PARAMS.workgroupSizeX
    );
    const workgroupsCntY = getItemsPerThread(
      level.height,
      SHADER_PARAMS.workgroupSizeY
    );

    // dispatch
    computePass.dispatchWorkgroups(workgroupsCntX, workgroupsCntY, 1);
    // console.log(`${DepthPyramidPass.NAME}.dispatch [${workgroupsCntX}, ${workgroupsCntY}, 1]`); // prettier-ignore
  }

  private createBindings = (
    device: GPUDevice,
    name: string,
    textureSrcView: GPUTextureView,
    textureDstView: GPUTextureView
  ): GPUBindGroup => {
    assertIsGPUTextureView(textureSrcView);
    assertIsGPUTextureView(textureDstView);
    const bindIdx = SHADER_PARAMS.bindings;

    return assignResourcesToBindings2(
      DepthPyramidPass,
      name,
      device,
      this.pipeline,
      [
        { binding: bindIdx.textureSrc, resource: textureSrcView },
        { binding: bindIdx.textureDst, resource: textureDstView },
      ]
    );
  };
}
