import { Mat4, mat4 } from 'wgpu-matrix';
import { BYTES_F32, CONFIG } from '../../constants.ts';
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

export class ImpostorBillboardTexture {
  private readonly textureView: GPUTextureView;

  constructor(private readonly texture: GPUTexture) {
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

const IMPOSTOR_VIEWS = CONFIG.impostors.views;
const IMPOSTOR_TEXTURE_SIZE = CONFIG.impostors.textureSize;
const OUT_TEXTURE_FORMAT: GPUTextureFormat = 'rgba8unorm';

export class ImpostorRenderer {
  public static NAME: string = ImpostorRenderer.name;
  private static CLEAR_COLOR = [0.0, 0.0, 0.0, 0.0];

  private readonly pipeline: GPURenderPipeline;
  private readonly matricesBuffer: GPUBuffer;
  private readonly matricesF32: Float32Array;

  constructor(
    device: GPUDevice,
    private readonly sampler: GPUSampler,
    private readonly fallbackTexture: GPUTextureView,
    outTextureFormat: GPUTextureFormat = OUT_TEXTURE_FORMAT
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
        targets: [{ format: outTextureFormat }],
      },
      primitive: PIPELINE_PRIMITIVE_TRIANGLE_LIST,
      depthStencil: PIPELINE_DEPTH_STENCIL_ON,
    });

    this.matricesBuffer = device.createBuffer({
      label: `${ImpostorRenderer.NAME}-matrices`,
      size: BYTES_MAT4 * (1 + IMPOSTOR_VIEWS),
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.INDIRECT |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC,
    });
    this.matricesF32 = new Float32Array(this.matricesBuffer.size / BYTES_F32);
  }

  createImpostorTexture(
    device: GPUDevice,
    mesh: ImpostorMesh,
    size = IMPOSTOR_TEXTURE_SIZE
  ): ImpostorBillboardTexture {
    const sizeW = size * IMPOSTOR_VIEWS;
    const resultTexture = device.createTexture({
      label: createLabel(ImpostorRenderer, mesh.name),
      dimension: '2d',
      size: [sizeW, size, 1],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // render views
    const cmdBuf = device.createCommandEncoder({
      label: `${ImpostorRenderer.NAME}-${mesh.name}-cmd-buffer`,
    });
    const result = this.renderImpostor(device, cmdBuf, resultTexture, mesh);
    device.queue.submit([cmdBuf.finish()]);

    return result;
  }

  /** Render with previously generated texture/cmd buffer */
  renderImpostor(
    device: GPUDevice,
    cmdBuf: GPUCommandEncoder,
    targetTexture: GPUTexture,
    mesh: ImpostorMesh
  ): ImpostorBillboardTexture {
    const targetTextureView = targetTexture.createView();
    // TODO [CRITICAL] destroy this texture after we are done! ATM it's memory leak. Or not cause JS?
    const depthTexture = device.createTexture({
      label: `${targetTexture}-depth`,
      size: [targetTexture.width, targetTexture.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
    const depthTextureView = depthTexture.createView();

    const bindings = this.createBindings(device, mesh);

    // https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass
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
        depthTextureView,
        'clear'
      ),
    });

    // set render pass data
    renderPass.setVertexBuffer(0, mesh.vertexBuffer);
    renderPass.setVertexBuffer(1, mesh.normalsBuffer);
    renderPass.setVertexBuffer(2, mesh.uvBuffer);
    renderPass.setIndexBuffer(mesh.indexBuffer, 'uint32');
    renderPass.setPipeline(this.pipeline);
    renderPass.setBindGroup(0, bindings);

    // count result impostors
    const textureSize = targetTexture.height;
    const viewCounts = Math.min(
      Math.floor(targetTexture.width / textureSize),
      IMPOSTOR_VIEWS
    );
    if (viewCounts == 0) {
      throw new Error(`Texture provided to renderImpostor() has dimensions ${targetTexture.width}x${targetTexture.height}px. It cannot hold even 1 impostor image?`); // prettier-ignore
    }
    if (viewCounts < IMPOSTOR_VIEWS) {
      console.warn(`Texture provided to renderImpostor() can only hold ${viewCounts} impostors instead of expected ${IMPOSTOR_VIEWS}. Expected width ${IMPOSTOR_VIEWS * textureSize}px but is ${targetTexture.width}px.`); // prettier-ignore
    }

    // draw
    for (let i = 0; i < viewCounts; i++) {
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
    const rotDelta = 360.0 / IMPOSTOR_VIEWS; // e.g. 30dgr
    const viewMats = createArray(IMPOSTOR_VIEWS).map((_, i) =>
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
