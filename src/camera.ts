import { mat4, vec3 } from 'wgpu-matrix';
import Input from './sys_web/input.ts';
import { CAMERA_CFG, CONFIG } from './constants.ts';
import { projectPoint } from './utils/index.ts';
import { STATS } from './sys_web/stats.ts';

export type CameraOpts = {
  position?: [number, number, number];
  rotation?: [number, number];
};

const PI_2 = Math.PI / 2;
const ANGLE_UP_DOWN = 0; // pitch
const ANGLE_LEFT_RIGHT = 1; // yaw

/** https://github.com/Scthe/WebFX/blob/09713a3e7ebaa1484ff53bd8a007908a5340ca8e/src/ecs/components/FpsController.ts */
export class Camera {
  private readonly _viewMatrix = mat4.identity();
  private readonly _tmpMatrix = mat4.identity(); // cache to prevent alloc
  private readonly _angles: [number, number] = [0, 0]; // angles like in polar coords
  private readonly _position: [number, number, number] = [0, 0, 0];

  constructor(options: CameraOpts = CAMERA_CFG.position) {
    this.resetPosition(options);
  }

  resetPosition = (options: CameraOpts = CAMERA_CFG.position) => {
    if (options.position?.length === 3) {
      this._position[0] = options.position[0];
      this._position[1] = options.position[1];
      this._position[2] = options.position[2];
    }
    if (options.rotation?.length === 2) {
      this._angles[0] = options.rotation[0];
      this._angles[1] = options.rotation[1];
    }
  };

  update(deltaTime: number, input: Input): void {
    this.applyMovement(deltaTime, input);
    this.applyRotation(deltaTime, input);

    const fmt = (x: number) => x.toFixed(1);
    const p = this._position;
    const r = this._angles;
    STATS.update('Camera pos', `[${fmt(p[0])}, ${fmt(p[1])}, ${fmt(p[2])}]`);
    STATS.update(
      'Camera rot',
      `[${fmt(r[ANGLE_LEFT_RIGHT])}, ${fmt(r[ANGLE_UP_DOWN])}]`
    );
  }

  private applyMovement(deltaTime: number, input: Input) {
    const sign = (positive: boolean, negative: boolean) =>
      (positive ? 1 : 0) - (negative ? 1 : 0);

    const digital = input.directions;
    const m =
      deltaTime *
      (digital.goFaster ? CONFIG.movementSpeedFaster : CONFIG.movementSpeed);
    const moveDir: [number, number, number, number] = [0, 0, 0, 1];
    moveDir[0] = m * sign(digital.right, digital.left);
    moveDir[1] = m * sign(digital.up, digital.down);
    moveDir[2] = m * sign(digital.backward, digital.forward);

    const rotMatrixInv = mat4.transpose(this.getRotationMat(), this._tmpMatrix);
    const moveDirLocal = projectPoint(rotMatrixInv, moveDir, moveDir);
    vec3.add(this._position, moveDirLocal, this._position);
  }

  private applyRotation(deltaTime: number, input: Input) {
    const yaw = input.mouse.x * deltaTime * CONFIG.rotationSpeed;
    const pitch = input.mouse.y * deltaTime * CONFIG.rotationSpeed;

    this._angles[ANGLE_LEFT_RIGHT] += yaw;
    this._angles[ANGLE_UP_DOWN] += pitch;
    const safePI = PI_2 * 0.95; // no extremes pls!
    this._angles[ANGLE_UP_DOWN] = clamp(
      this._angles[ANGLE_UP_DOWN],
      -safePI,
      safePI
    );
  }

  private getRotationMat() {
    const angles = this._angles;
    const result = mat4.identity(this._tmpMatrix);
    mat4.rotateX(result, angles[ANGLE_UP_DOWN], result); // up-down
    mat4.rotateY(result, angles[ANGLE_LEFT_RIGHT], result); // left-right
    return result;
  }

  get viewMatrix() {
    const rotMat = this.getRotationMat();
    const pos = this._position;

    // we have to reverse position, as moving camera X units
    // moves scene -X units
    return mat4.translate(
      rotMat,
      [-pos[0], -pos[1], -pos[2]],
      this._viewMatrix
    );
  }
}

function clamp(x: number, min: number, max: number): number {
  return Math.min(Math.max(x, min), max);
}
