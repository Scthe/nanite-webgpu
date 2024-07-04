import { Mat4, mat4 } from 'wgpu-matrix';
import { BYTES_F32, BYTES_VEC2, CONFIG } from '../../constants.ts';
import { BYTES_MAT4 } from '../../constants.ts';
import {
  labelShader,
  labelPipeline,
  PIPELINE_PRIMITIVE_TRIANGLE_LIST,
  PIPELINE_DEPTH_STENCIL_ON,
  useColorAttachment,
  assignResourcesToBindings2,
  createLabel,
  useDepthStencilAttachment,
} from '../../passes/_shared.ts';
import { SHADER_CODE, SHADER_PARAMS } from './renderImpostors.wgsl.ts';
import { BoundingSphere } from '../../utils/calcBounds.ts';
import { createArray, dgr2rad } from '../../utils/index.ts';
import { VERTEX_ATTRIBUTES } from '../../passes/naniteCpu/drawNanitesPass.ts';
import { assertIsGPUTextureView } from '../../utils/webgpu.ts';
import { createSampler } from '../../utils/textures.ts';

export class ImpostorBillboardTexture {
  public readonly textureView: GPUTextureView;

  constructor(public readonly texture: GPUTexture) {
    this.textureView = texture.createView();
  }

  bind = (idx: number): GPUBindGroupEntry => ({
    binding: idx,
    resource: this.textureView,
  });
}

export interface ImpostorMesh {
  name: string;
  vertexBuffer: GPUBuffer;
  normalsBuffer: GPUBuffer;
  uvBuffer: GPUBuffer;
  indexBuffer: GPUBuffer;
  triangleCount: number;
  bounds: BoundingSphere;
  texture: GPUTextureView | undefined;
}

// const OUT_TEXTURE_FORMAT: GPUTextureFormat = 'rgba8unorm'; // 8bit per channel, will be read as float [0-1]
const OUT_TEXTURE_FORMAT: GPUTextureFormat = 'rg32float';
export const IMPOSTOR_BYTES_PER_PIXEL = BYTES_VEC2;

export class ImpostorRenderer {
  public static NAME: string = ImpostorRenderer.name;
  private static CLEAR_COLOR = [0.0, 0.0, 0.0, 0.0];

  private readonly pipeline: GPURenderPipeline;
  private readonly matricesBuffer: GPUBuffer;
  private readonly matricesF32: Float32Array;
  private readonly sampler: GPUSampler;
  private readonly depthTexture: GPUTexture;
  private readonly depthTextureView: GPUTextureView;

  constructor(
    device: GPUDevice,
    private readonly fallbackTexture: GPUTextureView,
    private readonly viewCount = CONFIG.impostors.views,
    private readonly textureSize = CONFIG.impostors.textureSize
  ) {
    assertIsGPUTextureView(this.fallbackTexture);

    const shaderModule = device.createShaderModule({
      label: labelShader(ImpostorRenderer),
      code: SHADER_CODE(),
    });

    this.pipeline = device.createRenderPipeline({
      label: labelPipeline(ImpostorRenderer),
      layout: 'auto',
      vertex: {
        module: shaderModule,
        entryPoint: 'main_vs',
        buffers: VERTEX_ATTRIBUTES,
      },
      fragment: {
        module: shaderModule,
        entryPoint: 'main_fs',
        targets: [{ format: OUT_TEXTURE_FORMAT }],
      },
      primitive: PIPELINE_PRIMITIVE_TRIANGLE_LIST,
      depthStencil: PIPELINE_DEPTH_STENCIL_ON,
    });

    this.matricesBuffer = device.createBuffer({
      label: `${ImpostorRenderer.NAME}-matrices`,
      size: BYTES_MAT4 * (1 + this.viewCount),
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.INDIRECT |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });
    this.matricesF32 = new Float32Array(this.matricesBuffer.size / BYTES_F32);

    this.sampler = createSampler(device, 'linear');

    this.depthTexture = device.createTexture({
      label: createLabel(ImpostorRenderer, 'depth'),
      size: [this.textureSize * this.viewCount, this.textureSize],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    this.depthTextureView = this.depthTexture.createView();
  }

  createImpostorTexture(
    device: GPUDevice,
    mesh: ImpostorMesh
  ): ImpostorBillboardTexture {
    const resultTexture = this.createResultTexture(device, mesh);

    // render views
    const cmdBuf = device.createCommandEncoder({
      label: `${ImpostorRenderer.NAME}-${mesh.name}-cmd-buffer`,
    });
    const result = this.renderImpostorTexture(
      device,
      cmdBuf,
      resultTexture,
      mesh
    );
    device.queue.submit([cmdBuf.finish()]);

    return result;
  }

  private createResultTexture(device: GPUDevice, mesh: ImpostorMesh) {
    const sizeW = this.textureSize * this.viewCount;
    const extraUsage: GPUTextureDescriptor['usage'] = CONFIG.isTest
      ? GPUTextureUsage.COPY_SRC
      : 0;

    return device.createTexture({
      label: createLabel(ImpostorRenderer, mesh.name),
      dimension: '2d',
      size: [sizeW, this.textureSize, 1],
      format: OUT_TEXTURE_FORMAT,
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.RENDER_ATTACHMENT |
        extraUsage,
    });
  }

  /** Render to the target texture */
  private renderImpostorTexture(
    device: GPUDevice,
    cmdBuf: GPUCommandEncoder,
    targetTexture: GPUTexture,
    mesh: ImpostorMesh
  ): ImpostorBillboardTexture {
    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
    const targetTextureView = targetTexture.createView();
    const renderPass = cmdBuf.beginRenderPass({
      label: ImpostorRenderer.NAME,
      colorAttachments: [
        useColorAttachment(
          targetTextureView,
          ImpostorRenderer.CLEAR_COLOR,
          'clear'
        ),
      ],
      depthStencilAttachment: useDepthStencilAttachment(
        this.depthTextureView,
        'clear'
      ),
    });

    // set render pass data
    const bindings = this.createBindings(device, mesh);
    renderPass.setVertexBuffer(0, mesh.vertexBuffer);
    renderPass.setVertexBuffer(1, mesh.normalsBuffer);
    renderPass.setVertexBuffer(2, mesh.uvBuffer);
    renderPass.setIndexBuffer(mesh.indexBuffer, 'uint32');
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, bindings);

    const textureSize = this.textureSize;

    // draw
    for (let i = 0; i < this.viewCount; i++) {
      renderPass.setViewport(
        textureSize * i, // x
        0, // y
        textureSize, // w
        textureSize, // h
        0, // minDepth
        1 // maxDepth
      );
      // instance index holds which view matrix to use
      renderPass.drawIndexed(mesh.triangleCount * 3, 1, 0, 0, i);
    }

    // fin
    renderPass.end();

    return new ImpostorBillboardTexture(targetTexture);
  }

  private createBindings = (
    device: GPUDevice,
    mesh: ImpostorMesh
  ): GPUBindGroup => {
    const b = SHADER_PARAMS.bindings;

    const projMat = this.getProjectionMat(mesh);
    const rotDelta = 360.0 / this.viewCount; // e.g. 30dgr
    const viewMats = createArray(this.viewCount).map((_, i) =>
      mat4.rotationY(dgr2rad(rotDelta * i))
    );
    this.writeUniforms(device, projMat, viewMats);

    const texture = mesh.texture || this.fallbackTexture;
    assertIsGPUTextureView(texture);

    return assignResourcesToBindings2(
      ImpostorRenderer,
      `${ImpostorRenderer.NAME}-${mesh.name}`,
      device,
      this.pipeline,
      [
        { binding: b.matrices, resource: { buffer: this.matricesBuffer } },
        { binding: b.diffuseTexture, resource: texture },
        { binding: b.sampler, resource: this.sampler },
      ]
    );
  };

  private writeUniforms(device: GPUDevice, projMat: Mat4, viewMats: Mat4[]) {
    let offsetBytes = 0;
    offsetBytes = this.writeMat4(offsetBytes, projMat);
    viewMats.forEach((mat) => {
      offsetBytes = this.writeMat4(offsetBytes, mat);
    });
    if (
      offsetBytes !== this.matricesF32.byteLength ||
      offsetBytes !== this.matricesBuffer.size
    ) {
      throw new Error(`Impostor matrices write error. GPUBuffer has ${this.matricesBuffer.size} bytes, CPU buffer is ${this.matricesF32.byteLength}, but have used ${offsetBytes} bytes.`); // prettier-ignore
    }

    device.queue.writeBuffer(this.matricesBuffer, 0, this.matricesF32);
  }

  // TODO copied from renderUniformsBuffer.ts. Use some BufferData/BufferWritter class?
  private writeMat4(offsetBytes: number, mat: Mat4) {
    const offset = offsetBytes / BYTES_F32;
    for (let i = 0; i < 16; i++) {
      this.matricesF32[offset + i] = mat[i];
    }
    return offsetBytes + BYTES_MAT4;
  }

  private getProjectionMat(mesh: ImpostorMesh) {
    const b = mesh.bounds;
    const r = b.radius;
    return mat4.ortho(
      b.center[0] - r,
      b.center[0] + r,
      b.center[1] - r,
      b.center[1] + r,
      b.center[2] - r,
      b.center[2] + r
    );
  }
}
