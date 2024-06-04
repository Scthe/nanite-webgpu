type ErrorCb = (msg: string) => never;

export function createErrorSystem(device: GPUDevice) {
  const ERROR_SCOPES: GPUErrorFilter[] = [
    'internal',
    'out-of-memory',
    'validation',
  ];
  const ERROR_SCOPES_REV = ERROR_SCOPES.toReversed();

  let currentScopeName = '-';

  return {
    startErrorScope,
    reportErrorScopeAsync,
  };

  function startErrorScope(scopeName: string = '-') {
    currentScopeName = scopeName;
    ERROR_SCOPES.forEach((sc) => device.pushErrorScope(sc));
  }

  async function reportErrorScopeAsync(cb?: ErrorCb) {
    let lastError = undefined;

    for (const name of ERROR_SCOPES_REV) {
      const err = await device.popErrorScope();
      if (err) {
        const msg = `WebGPU error [${currentScopeName}][${name}]: ${err.message}`;
        lastError = msg;
        if (cb) {
          cb(msg);
        } else {
          console.error(msg);
        }
      }
    }

    return lastError;
  }
}

export const rethrowWebGPUError = (msg: string): never => {
  throw new Error(msg);
};
