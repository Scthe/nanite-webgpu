import * as png from 'png';
import { createCapture, getRowPadding } from 'std/webgpu';
import {
  createGpuDevice_TESTS,
  injectMeshoptimizerWASM,
  injectMetisWASM,
  relativePath,
} from '../../sys_deno/testUtils.ts';
import {
  createGPU_IndexBuffer,
  createGPU_VertexBuffer,
} from '../../utils/webgpu.ts';
import { calcBoundingBox, calcBoundingSphere } from '../../utils/calcBounds.ts';
import { Dimensions } from '../../utils/index.ts';
import { ImpostorMesh, ImpostorRenderer } from './renderImpostors.ts';

// needed cause stray imports TODO [LOW] fix imports?
import '../../lib/meshoptimizer.d.ts';
import '../../lib/metis.d.ts';
import { CONFIG } from '../../constants.ts';
import { vec3 } from 'wgpu-matrix';
injectMeshoptimizerWASM();
injectMetisWASM();

function vertex(pos: [number, number, number]): number[] {
  return [...pos];
}
function createVertices() {
  const vertexData = new Float32Array([
    // top (0, 0, 1)
    ...vertex([-1, -1, 1]),
    ...vertex([1, -1, 1]),
    ...vertex([1, 1, 1]),
    ...vertex([-1, 1, 1]),
    // bottom (0, 0, -1)
    ...vertex([-1, 1, -1]),
    ...vertex([1, 1, -1]),
    ...vertex([1, -1, -1]),
    ...vertex([-1, -1, -1]),
    // right (1, 0, 0)
    ...vertex([1, -1, -1]),
    ...vertex([1, 1, -1]),
    ...vertex([1, 1, 1]),
    ...vertex([1, -1, 1]),
    // left (-1, 0, 0)
    ...vertex([-1, -1, 1]),
    ...vertex([-1, 1, 1]),
    ...vertex([-1, 1, -1]),
    ...vertex([-1, -1, -1]),
    // front (0, 1, 0)
    ...vertex([1, 1, -1]),
    ...vertex([-1, 1, -1]),
    ...vertex([-1, 1, 1]),
    ...vertex([1, 1, 1]),
    // back (0, -1, 0)
    ...vertex([1, -1, 1]),
    ...vertex([-1, -1, 1]),
    ...vertex([-1, -1, -1]),
    ...vertex([1, -1, -1]),
  ]);

  // prettier-ignore
  const indexData = new Uint32Array([
    0, 1, 2, 2, 3, 0, // top
    4, 5, 6, 6, 7, 4, // bottom
    8, 9, 10, 10, 11, 8, // right
    12, 13, 14, 14, 15, 12, // left
    16, 17, 18, 18, 19, 16, // front
    20, 21, 22, 22, 23, 20, // back
  ]);

  return { vertexData, indexData };
}

const OUTPUT_PATH = relativePath(import.meta, 'test_result.png');
const OBJ_NAME = 'impostor-cube';
const OUT_TEXTURE_FORMAT = 'rgba8unorm-srgb';
const IMPOSTOR_VIEWS = CONFIG.impostors.views;
const IMPOSTOR_IMAGE_SIZE = 200;
const TEXTURE_DIMENSIONS: Dimensions = {
  width: IMPOSTOR_IMAGE_SIZE * IMPOSTOR_VIEWS,
  height: IMPOSTOR_IMAGE_SIZE,
};

// TODO [NOW] restore
// TODO [NOW] turn this into proper Deno.test?
// TODO [NOW] move the util functions somewhere

// Deno.test('renderImpostors(', async () => {
const main = async () => {
  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();

  // const uniforms = new RenderUniformsBuffer(device);
  const { vertexData, indexData } = createVertices();
  const bbox = calcBoundingBox(vertexData);
  const bSphere = calcBoundingSphere(bbox);
  // console.log(bSphere);

  const vertexBuffer = createGPU_VertexBuffer(
    device,
    `${OBJ_NAME}-verts`,
    vertexData
  );
  const indexBuffer = createGPU_IndexBuffer(
    device,
    `${OBJ_NAME}-indices`,
    indexData
  );
  const mesh: ImpostorMesh = {
    vertexBuffer,
    indexBuffer,
    name: OBJ_NAME,
    triangleCount: indexData.length / 3,
    bounds: bSphere,
  };

  const denoResult = createCapture(
    device,
    TEXTURE_DIMENSIONS.width,
    TEXTURE_DIMENSIONS.height
  );

  const pass = new ImpostorRenderer(device, OUT_TEXTURE_FORMAT);

  // submit
  const cmdBuf = device.createCommandEncoder();
  pass.renderImpostor(device, cmdBuf, denoResult.texture, mesh);
  copyToBuffer(
    cmdBuf,
    denoResult.texture,
    denoResult.outputBuffer,
    TEXTURE_DIMENSIONS
  );
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  await createPng(denoResult.outputBuffer, TEXTURE_DIMENSIONS);

  // cleanup
  device.destroy();
};

main();

function copyToBuffer(
  encoder: GPUCommandEncoder,
  texture: GPUTexture,
  outputBuffer: GPUBuffer,
  dimensions: Dimensions
): void {
  const { padded } = getRowPadding(dimensions.width);

  encoder.copyTextureToBuffer(
    {
      texture,
    },
    {
      buffer: outputBuffer,
      bytesPerRow: padded,
    },
    dimensions
  );
}

async function createPng(
  buffer: GPUBuffer,
  dimensions: Dimensions
): Promise<void> {
  await buffer.mapAsync(1);
  const inputBuffer = new Uint8Array(buffer.getMappedRange());
  const { padded, unpadded } = getRowPadding(dimensions.width);
  const outputBuffer = new Uint8Array(unpadded * dimensions.height);

  for (let i = 0; i < dimensions.height; i++) {
    const slice = inputBuffer
      .slice(i * padded, (i + 1) * padded)
      .slice(0, unpadded);

    outputBuffer.set(slice, i * unpadded);
  }

  const image = png.encode(outputBuffer, dimensions.width, dimensions.height, {
    stripAlpha: true,
    color: 2,
  });
  Deno.writeFileSync(OUTPUT_PATH, image);

  buffer.unmap();
}
