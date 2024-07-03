import * as png from 'png';
import { getRowPadding } from 'std/webgpu';
import { Dimensions } from '../utils/index.ts';

export function cmdCopyTextureToBuffer(
  cmdBuf: GPUCommandEncoder,
  texture: GPUTexture,
  outputBuffer: GPUBuffer,
  dimensions: Dimensions
): void {
  const { padded } = getRowPadding(dimensions.width);

  cmdBuf.copyTextureToBuffer(
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

export async function writePng(
  buffer: GPUBuffer,
  dimensions: Dimensions,
  outputPath: string
): Promise<Uint8Array> {
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
  console.log(`Write: ${outputPath}`);
  Deno.writeFileSync(outputPath, image);

  buffer.unmap();
  return outputBuffer;
}
