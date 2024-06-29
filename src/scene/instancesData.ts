import { Mat4, mat4 } from 'wgpu-matrix';
import { BYTES_MAT4 } from '../constants.ts';
import { randomBetween, dgr2rad } from '../utils/index.ts';
import { writeMatrixToGPUBuffer } from '../utils/webgpu.ts';

export type InstancesGridDef = {
  countX: number;
  countY: number;
  spacing: number;
  offsetX: number;
  offsetY: number;
};
export const getInstancesCount = (g: InstancesGridDef) => g.countX * g.countY;

export function createGrid(
  countX: number = 10,
  countY: number = 10,
  spacing: number = 1.3,
  offsetX = 0,
  offsetY = 0
): InstancesGridDef {
  return { countX, countY, spacing, offsetX, offsetY };
}

export interface NaniteInstancesData {
  transforms: Array<Mat4>;
  /** Array of Mat4 */
  transformsBuffer: GPUBuffer;
  count: number;
}

export function createInstancesData(
  device: GPUDevice,
  name: string,
  grid: InstancesGridDef
): NaniteInstancesData {
  const transformsBuffer = device.createBuffer({
    label: `${name}-nanite-transforms`,
    size: BYTES_MAT4 * grid.countX * grid.countY,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });
  const transforms: Array<Mat4> = [];

  let offsetBytes = 0;
  for (let x = 0; x < grid.countX; x++) {
    for (let y = 0; y < grid.countY; y++) {
      const moveMat = mat4.translation([
        -x * grid.spacing + grid.offsetX,
        0,
        -y * grid.spacing + grid.offsetY,
      ]);
      const angleDgr = x == 0 && y == 0 ? 0 : randomBetween(0, 360);
      // const angleDgr = x * -90; // use if you just want to have preview for other angles
      const rotMat = mat4.rotationY(dgr2rad(angleDgr));
      const tfxMat = mat4.multiply(moveMat, rotMat);

      transforms.push(tfxMat);
      writeMatrixToGPUBuffer(device, transformsBuffer, offsetBytes, tfxMat);
      offsetBytes += BYTES_MAT4;
    }
  }

  const count = getInstancesCount(grid);
  return { transforms, transformsBuffer, count };
}
