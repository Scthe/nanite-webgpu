import { mat4 } from 'wgpu-matrix';
import Input from './sys_web/input.ts';
import { CONFIG, CAMERA_CFG } from './constants.ts';

export interface CameraOpts {
  position?: [number, number, number];
  target?: [number, number, number];
}

const UP = [0, 1, 0];

export class Camera {
  public readonly viewMatrix: mat4.Mat4;

  constructor(
    options: Pick<typeof CAMERA_CFG, 'position' | 'target'> = CAMERA_CFG
  ) {
    this.viewMatrix = mat4.lookAt(options.position, options.target, UP);
  }

  translate(x: number, y: number, z: number) {
    const viewInv = mat4.inverse(this.viewMatrix);
    mat4.translate(viewInv, [x, y, z], viewInv);
    mat4.inverse(viewInv, this.viewMatrix);
  }

  rotate(x: number, y: number, z: number) {
    const viewInv = mat4.inverse(this.viewMatrix);
    mat4.rotateX(viewInv, y, viewInv);
    mat4.rotateY(viewInv, x, viewInv);
    mat4.rotateZ(viewInv, z, viewInv);
    mat4.inverse(viewInv, this.viewMatrix);
  }

  update(deltaTime: number, input: Input): mat4.Mat4 {
    const sign = (positive: boolean, negative: boolean) =>
      (positive ? 1 : 0) - (negative ? 1 : 0);

    const digital = input.directions;
    const m = deltaTime * CONFIG.movementSpeed * (digital.goFaster ? 10 : 1);
    const deltaRight = m * sign(digital.right, digital.left);
    const deltaUp = m * sign(digital.up, digital.down);
    const deltaBack = m * sign(digital.backward, digital.forward);
    this.translate(deltaRight, deltaUp, deltaBack);

    let yaw = input.mouse.x * deltaTime * CONFIG.rotationSpeed;
    let pitch = input.mouse.y * deltaTime * CONFIG.rotationSpeed;
    yaw = mod(yaw, Math.PI * 2);
    pitch = clamp(pitch, -Math.PI / 2, Math.PI / 2);
    this.rotate(-yaw, -pitch, 0);
  }
}

function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}

function mod(x: number, div: number): number {
  return x - Math.floor(Math.abs(x) / div) * div * Math.sign(x);
}
