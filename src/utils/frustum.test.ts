import { assertEquals } from 'assert';
import { Frustum } from './frustum.ts';
import { mat4, vec4 } from 'wgpu-matrix';
import { Camera } from '../camera.ts';
import { dgr2rad, getViewProjectionMatrix } from './index.ts';

Deno.test('Frustum', async (t) => {
  const camera = new Camera({
    position: [0, 0, 0],
    rotation: [0, 0],
  });
  // console.log(dbgMat(camera.viewMatrix));
  const projMat = mat4.perspective(
    dgr2rad(90), // we are dealing with 45dgr angles to make it easier
    1, // aspectRatio
    1, // zNear
    10 // zFar
  );
  const vpMatrix = getViewProjectionMatrix(camera.viewMatrix, projMat);

  const frustum = new Frustum();
  frustum.update(vpMatrix);
  // console.log(frustum.toStr());

  // test-sphere util fn
  const assertSphere = (a: number[], exp: boolean, msg: string) => {
    return t.step(msg, () => {
      const sphere = vec4.create(a[0], a[1], a[2], a[3]);
      const actual = frustum.isInside(sphere);
      assertEquals(actual, exp, msg);
    });
  };

  // Do not ask me why all 'z' coordinates are negated. I verifed that app works, so adding tests to match

  await assertSphere([0, 0, -3, 1], true, 'sphere inside the frustum');
  await assertSphere([0, 0, 0, 10], true, 'big sphere');
  // Frustum is 90dgr in both horiz. and vert. Positioned on (0, 0, 0).
  // Points toward (0, 0, 1). So (5, 0, 5) would lie exactly on the 'edge'.
  await assertSphere([10, 0, -5, 1], false, 'fails right plane');
  await assertSphere([-10, 0, -5, 1], false, 'fails left plane');
  await assertSphere([0, 10, -5, 1], false, 'fails bottom plane');
  await assertSphere([0, -10, -5, 1], false, 'fails top plane');
  await assertSphere([0, 0, -0.1, -0.05], false, 'fails: between (0, 0, 0) and near plane'); // prettier-ignore
  await assertSphere([0, 0, 0, 0.5], false, 'fails near plane (point at camera position)'); // prettier-ignore
  await assertSphere([0, 0, -12, 1], false, 'fails far plane');
});
