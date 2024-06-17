import { Mat4, Vec4, vec3, vec4 } from 'wgpu-matrix';

/** cached: prevent runtime memory alloc. */
const tmpVec = vec4.create();

/**
 * Left handed, where:
 *
 * - right: (1, 0, 0)
 * - up: (0, 1, 0)
 * - forward: (0, 0, 1)
 *
 * Same as WebGL: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_model_view_projection
 */
export class Frustum {
  private static PLANE_NAMES = [
    'left',
    'right',
    'top',
    'bottom',
    'near',
    'far',
  ];
  readonly planes = new Float32Array(24);

  /**
   * https://www8.cs.umu.se/kurser/5DV051/HT12/lab/plane_extraction.pdf
   *
   * NDC culling:
   *
   * * -1.0 ≤ x ≤ 1.0  --->  -w ≤ x' ≤ w
   * * -1.0 ≤ y ≤ 1.0  --->  -w ≤ y' ≤ w
   * * -0.0 ≤ z ≤ 1.0  --->  -0 ≤ z' ≤ w (NOTE: this depends on actual matrices, you might have to use `-w ≤ z'` just like the rest)
   *
   * And (https://github.com/greggman/wgpu-matrix/blob/main/src/vec4-impl.ts#L652):
   *
   * * `x' = m[0] * p.x + m[4] * p.y + m[ 8] * p.z + m[12] * w;`
   * * `y' = m[1] * p.x + m[5] * p.y + m[ 9] * p.z + m[13] * w;`
   * * `z' = m[2] * p.x + m[6] * p.y + m[10] * p.z + m[14] * w;`
   * * `w  = m[3] * p.x + m[7] * p.y + m[11] * p.z + m[15] * w;`
   *
   * For `-w ≤ x'  ---> -w - x' ≤ 0` (left plane):
   *
   * * `-(m[0] + m[3]) * p.x - (m[4] + m[7]) * p.y - (m[8] + m[11]) * p.z - (m[12] + m[15]) * w ≤ 0`
   *
   * For `x' ≤ w  ---> x' -w ≤ 0` (right plane):
   *
   * * `(m[0] - m[3]) * p.x + (m[4] - m[7]) * p.y + (m[8] - m[11]) * p.z + (m[12] - m[15]) * w ≤ 0`
   *
   * For `-0 ≤ z'` (near plane, if `-w ≤ z'` does not work)
   *
   * * `0 ≤ m[2] * p.x + m[6] * p.y + m[10] * p.z + m[14] * w;`
   *
   * etc.
   */
  update(vpMatrix: Mat4) {
    const m = vpMatrix;

    // 0: Left clipping plane: -w ≤ x'
    vec3.set(-(m[0] + m[3]), -(m[4] + m[7]), -(m[8] + m[11]), tmpVec);
    let l = vec3.length(tmpVec);
    this.planes[0] = tmpVec[0] / l;
    this.planes[1] = tmpVec[1] / l;
    this.planes[2] = tmpVec[2] / l;
    this.planes[3] = -(m[12] + m[15]) / l;
    // 1: Right clipping plane: x' ≤ w
    vec3.set(m[0] - m[3], m[4] - m[7], m[8] - m[11], tmpVec);
    l = vec3.length(tmpVec);
    this.planes[4] = tmpVec[0] / l;
    this.planes[5] = tmpVec[1] / l;
    this.planes[6] = tmpVec[2] / l;
    this.planes[7] = (m[12] - m[15]) / l;
    // 2 Top clipping plane: -w ≤ y'
    vec3.set(-(m[1] + m[3]), -(m[5] + m[7]), -(m[9] + m[11]), tmpVec);
    l = vec3.length(tmpVec);
    this.planes[8] = tmpVec[0] / l;
    this.planes[9] = tmpVec[1] / l;
    this.planes[10] = tmpVec[2] / l;
    this.planes[11] = -(m[13] + m[15]) / l;
    // 3: Bottom clipping plane: y' ≤ w
    vec3.set(m[1] - m[3], m[5] - m[7], m[9] - m[11], tmpVec);
    l = vec3.length(tmpVec);
    this.planes[12] = tmpVec[0] / l;
    this.planes[13] = tmpVec[1] / l;
    this.planes[14] = tmpVec[2] / l;
    this.planes[15] = (m[13] - m[15]) / l;
    // 4: Near clipping plane: -0 ≤ z'
    vec3.set(-(m[2] + m[3]), -(m[6] + m[7]), -(m[10] + m[11]), tmpVec);
    l = vec3.length(tmpVec);
    this.planes[16] = tmpVec[0] / l;
    this.planes[17] = tmpVec[1] / l;
    this.planes[18] = tmpVec[2] / l;
    this.planes[19] = -(m[14] + m[15]) / l;
    // 5: Far clipping plane: z' ≤ w
    vec3.set(m[2] - m[3], m[6] - m[7], m[10] - m[11], tmpVec);
    l = vec3.length(tmpVec);
    this.planes[20] = tmpVec[0] / l;
    this.planes[21] = tmpVec[1] / l;
    this.planes[22] = tmpVec[2] / l;
    this.planes[23] = (m[14] - m[15]) / l;
  }

  /** REMEMBER: sphere is world space */
  isInside(sphereWorldSpace: Vec4) {
    const s = sphereWorldSpace;
    let result = true;

    for (let i = 0; i < 6; i++) {
      const distance =
        s[0] * this.planes[i * 4] + // plane.nx
        s[1] * this.planes[i * 4 + 1] + // plane.ny
        s[2] * this.planes[i * 4 + 2] + // plane.nz
        this.planes[i * 4 + 3]; // plane.d

      // The point is $distance away from the plane. The sign indicates
      // in front/back. But the sphere has $radius.
      // * For point we want the $distance to be negative.
      //   Depends on the normal direction, but this is for our case.
      // * For sphere we want $distance - $radius to be negative.
      //   So the point on the 'positive' side, can still become negative.
      //   with big enough radius.
      const inFront = distance <= s[3];
      // console.log(`${Frustum.PLANE_NAMES[i]}: ${inFront} (dist=${distance.toFixed(2)} ,  r=${s[3].toFixed(2)} ,  to 0=${(distance+s[3]).toFixed(2)})`); // prettier-ignore
      result = result && inFront;
    }

    return result;
  }

  toStr() {
    const fmt = (i: number) => this.planes[i].toFixed(2);
    const p2str = (i: number) =>
      `[${fmt(i)}, ${fmt(i + 1)}, ${fmt(i + 2)},  d=${fmt(i + 3)}]`;
    const ps = Frustum.PLANE_NAMES.map(
      (name, i) => '  ' + name + ': ' + p2str(i * 4)
    );
    return `Frustum:( \n${ps.join('\n')}\n)`;
  }
}
