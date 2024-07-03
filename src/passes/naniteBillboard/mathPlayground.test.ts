import { assertAlmostEquals } from 'assert';
import { vec2, vec3, Vec3 } from 'wgpu-matrix';

const degrees = (x: number) => x * (180 / Math.PI);
const makeAnglePositive = (dgr: number) => {
  while (dgr < 0.0) {
    dgr += 360.0;
  }
  return dgr;
};
const p = (x: Vec3) =>
  `[${x[0].toFixed(2)}, ${x[1].toFixed(2)}, ${x[2].toFixed(2)}]`;

/** https://math.stackexchange.com/questions/878785/how-to-find-an-angle-in-range0-360-between-2-vectors */
function angleDgr_axisXZ(vecA: Vec3, vecB: Vec3) {
  const va = vec2.normalize(vec2.create(vecA[0], vecA[2]));
  const vb = vec2.normalize(vec2.create(vecB[0], vecB[2]));
  const dot = va[0] * vb[0] + va[1] * vb[1];
  const det = va[0] * vb[1] - va[1] * vb[0];
  const angle = Math.atan2(det, dot);

  const angleDgr = degrees(angle);
  return makeAnglePositive(angleDgr);
}

Deno.test('Billboard rotation math playground', async (t) => {
  const vec = (...args: number[]) => vec3.create(...args);

  await testAngle(vec(0, 1.0, 2.5), 0); // front
  await testAngle(vec(0, 1.0, -2.5), 180); // behind
  await testAngle(vec(1, 1.0, 2.5), -21.8);
  await testAngle(vec(-1, 1.0, 2.5), 21.8);
  await testAngle(vec(3, 1.0, 3), -45); // front left
  await testAngle(vec(-3, 1.0, 3), 45); // front right
  await testAngle(vec(2, 1.0, 0), 270); // left
  await testAngle(vec(-2, 1.0, 0), 90); // right
  await testAngle(vec(3, 1.0, -3), 225); // behind left
  await testAngle(vec(-3, 1.0, -3), 135); // behind right

  function testAngle(cameraPos: Vec3, expAngle: number) {
    return t.step(
      `Camera ${p(cameraPos)}, expected angle ${expAngle.toFixed(2)}`,
      () => {
        // console.log(`\nCamera ${p(cameraPos)}`);
        const camera2ModelDir = vec3.create(
          cameraPos[0],
          cameraPos[1],
          cameraPos[2]
        );

        const objectFrontDir = vec3.create(0, 0, 1.0);

        const angle = angleDgr_axisXZ(objectFrontDir, camera2ModelDir);
        // console.log(`Angle ${angle}`);
        expAngle = makeAnglePositive(expAngle);
        assertAlmostEquals(angle, expAngle, 1);
      }
    );
  }
});

/*
const angleDgr2 = (objectFrontDir, camera2ModelDir) => degrees(vec3.angle(objectFrontDir, camera2ModelDir))

function angleDgr(vecA: Vec3, vecB: Vec3) {
  const vecAn = vec3.normalize(vecA);
  const vecBn = vec3.normalize(vecB);
  const angleCos = vec3.dot(vecAn, vecBn);
  // hmm, length cannot be negative..
  const angleSin = vec3.length(vec3.cross(vecAn, vecBn));
  console.log({ angleCos, angleSin });

  let dgr = degrees(Math.atan2(angleSin, angleCos));
  while (dgr < 0.0) {
    dgr += 360.0;
  }
  return dgr;
}
*/
