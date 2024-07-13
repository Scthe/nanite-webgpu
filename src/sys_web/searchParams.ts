import { CONFIG } from '../constants.ts';
import { SCENES, isValidSceneName } from '../scene/sceneFiles.ts';
import { SceneName } from '../scene/sceneFiles.ts';

const PARAMS = {
  sceneFile: 'scene_file',
  softwareRasterizerThreshold: 'softwarerasterizer_threshold',
  impostorsThreshold: 'impostors_threshold',
  impostorsTextureSize: 'impostors_texturesize',
};

export const INVALID_SEARCH_PARAMS: string[] = [];

export function applySearchParams(
  target: typeof CONFIG,
  defaultScene: SceneName
): SceneName {
  const params = new URLSearchParams(window.location.search);

  params.forEach((val, key) => {
    key = key.toLowerCase();
    val = val.trim();

    if (key === PARAMS.sceneFile) {
      if (isValidSceneName(val)) {
        defaultScene = val;
      } else {
        console.warn(`Invalid scene name '${val}', try one of: `, Object.keys(SCENES)); // prettier-ignore
      }
    } else if (key === PARAMS.softwareRasterizerThreshold) {
      const [isOk, value] = parseNumber(val);
      if (isOk) {
        if (value === 0) {
          target.softwareRasterizer.enabled = false;
        } else {
          target.softwareRasterizer.threshold = Math.abs(value);
        }
      }
    } else if (key === PARAMS.impostorsThreshold) {
      const [isOk, value] = parseNumber(val);
      if (isOk) {
        target.impostors.billboardThreshold = Math.abs(value);
      }
    } else if (key === PARAMS.impostorsTextureSize) {
      const [isOk, value] = parseNumber(val);
      if (isOk) {
        target.impostors.textureSize = Math.abs(value);
      }
    } else {
      INVALID_SEARCH_PARAMS.push(key);
    }
  });

  if (!CONFIG.isTest) {
    if (INVALID_SEARCH_PARAMS.length > 0) {
      const keys = INVALID_SEARCH_PARAMS.join(', ');
      console.warn(`Unrecognised query params: [${keys}]`);
    }

    console.log(`Loading scene '${defaultScene}', config: `, target);
  }

  return defaultScene;
}

function parseNumber(val: unknown): [boolean, number] {
  if (typeof val !== 'string') return [false, 0];
  const res = parseFloat(val);
  const isValid = !isNaN(res) && isFinite(res);
  return [isValid, res];
}
