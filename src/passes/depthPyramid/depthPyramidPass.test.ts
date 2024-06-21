import { assertEquals } from 'assert';
import {
  assertSameArray,
  cmdCopyTextureToBuffer,
  createGpuDevice_TESTS,
  createMockPassCtx,
  createTextureReadbackBuffer,
  parseTextureBufferF32,
} from '../../sys_deno/testUtils.ts';
import { DepthPyramidPass } from './depthPyramidPass.ts';
import { BYTES_F32, BYTES_U8 } from '../../constants.ts';
import { readBufferToCPU } from '../../utils/webgpu.ts';
import { Dimensions } from '../../utils/index.ts';

Deno.test('DepthPyramidPass: between mip maps', async () => {
  const DIM_SRC: Dimensions = { width: 8, height: 8 };
  /*
  // ASCII art:
  0    1    2    3    4    5    6    7
  8    9   10   11   12   13   14   15
  16   17   18   19   20   21   22   23
  24   25   26   27   28   29   30   31
  32   33   34   35   36   37   38   39
  40   41   42   43   44   45   46   47
  48   49   50   51   52   53   54   55
  56   57   58   59   60   61   62   63

  // generate ASCII art:
  for (let y = 0; y < DIM_SRC; y++) {
    let s = '';
    for (let x = 0; x < DIM_SRC; x++) {
      s += y * DIM_SRC + x + '   ';
    }
    console.log(s);
  }
  */
  const EXPECTED_MIP_0 = [
    [9, 11, 13, 15],
    [25, 27, 29, 31],
    [41, 43, 45, 47],
    [57, 59, 61, 63],
  ];
  const EXPECTED_MIP_1 = [
    [27, 31],
    [59, 63],
  ];
  const EXPECTED_PER_MIP = [EXPECTED_MIP_0, EXPECTED_MIP_1];

  const [device, reportWebGPUErrAsync] = await createGpuDevice_TESTS();

  // texture SRC
  const textureSrc = device.createTexture({
    label: 'test-texture-src',
    dimension: '2d',
    size: [DIM_SRC.width, DIM_SRC.height, 1],
    // format: 'rgba8unorm',
    format: 'r8unorm',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
  });
  // write: https://webgpu.github.io/webgpu-samples/?sample=samplerParameters#main.ts
  const data = new Uint8Array(DIM_SRC.width * DIM_SRC.height);
  data.forEach((_e, i) => {
    data[i] = i;
  });
  device.queue.writeTexture(
    { texture: textureSrc },
    data,
    { bytesPerRow: DIM_SRC.width * BYTES_U8 }, // it's unorm!
    [DIM_SRC.width, DIM_SRC.height]
  );
  const textureSrcView = textureSrc.createView();

  // pass
  const pass = new DepthPyramidPass(device);
  const [textureDst, _textureDstView] = pass.verifyResultTexture(
    device,
    textureSrc,
    textureSrcView
  );

  // buffer DST
  const readbackBuffers = pass.pyramidLevels.map((level) =>
    createTextureReadbackBuffer(device, {
      width: level.width,
      height: level.height,
      bytesPerPixel: BYTES_F32,
    })
  );

  // submit
  const cmdBuf = device.createCommandEncoder();
  const passCtx = createMockPassCtx(device, cmdBuf);
  pass.cmdCreateDepthPyramid(passCtx, textureSrc, textureSrcView);
  pass.pyramidLevels.forEach((level, idx) => {
    const buf = readbackBuffers[idx];
    cmdCopyTextureToBuffer(cmdBuf, textureDst, BYTES_F32, buf, {
      miplevel: level.level,
      width: level.width,
      height: level.height,
    });
  });
  device.queue.submit([cmdBuf.finish()]);

  await reportWebGPUErrAsync();

  // read back
  const assertPyramidLevelsAsync = pass.pyramidLevels.map(
    async (level, idx): Promise<void> => {
      // download and parse
      const resultDataF32Arr = await readBufferToCPU(
        Float32Array,
        readbackBuffers[idx]
      );
      const result = parseTextureBufferF32(
        level.width,
        level.height,
        resultDataF32Arr
      );
      // console.log(result);

      // assert
      const expected = EXPECTED_PER_MIP[idx];
      assertEquals(
        result.length,
        expected.length,
        `[Mip ${level.level}] Different image row count: ${result.length} vs ${expected.length}`
      );
      expected.forEach((expArr, idx) => {
        assertSameArray(result[idx], expArr);
      });
    }
  );
  await Promise.all(assertPyramidLevelsAsync);

  // cleanup
  device.destroy();
});
