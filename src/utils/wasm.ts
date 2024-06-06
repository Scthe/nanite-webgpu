// https://stackoverflow.com/questions/41875728/pass-a-javascript-array-as-argument-to-a-webassembly-function

import {
  WasmHeap,
  WasmArray,
  WasmPtrInout,
  WasmBasicType,
  WasmBasicTypeName,
} from './wasm.ts';

export const wasmPtr = (arr: WasmArray, inout: WasmPtrInout = 'in') => ({
  arr,
  inout,
});

function copyToWasmHeap<T extends WasmArray>(
  module: WebAssembly.Module,
  heap: WasmHeap,
  arr: T
) {
  const heapPointer = module._malloc(arr.length * arr.BYTES_PER_ELEMENT);
  module[heap].set(arr, heapPointer / arr.BYTES_PER_ELEMENT);
  return heapPointer;
}

function getMemoryHeapForJsArray(arr: WasmArray): WasmHeap | undefined {
  if (arr instanceof Float32Array) return 'HEAPF32';
  if (arr instanceof Uint32Array) return 'HEAPU32';
  if (arr instanceof Uint8Array) return 'HEAPU8';
  return undefined;
}

function transformIntoWasmArg(
  module: WebAssembly.Module,
  fnName: string,
  arg: WasmBasicType
) {
  if (typeof arg === 'number' || typeof arg === 'string') {
    return arg;
  }
  const heap = getMemoryHeapForJsArray(arg.arr);
  if (heap) {
    return copyToWasmHeap(module, heap, arg.arr);
  }
  throw new Error(
    `Wasm function '${fnName}' received invalid argument: ${arg}`
  );
}

export const meshoptCall = <
  FnName extends keyof typeof meshoptimizer,
  RetType extends ReturnType<(typeof meshoptimizer)[FnName]>
>(
  module: WebAssembly.Module,
  returnTypeName: WasmBasicTypeName,
  fnName: FnName,
  argsJS: Parameters<(typeof meshoptimizer)[FnName]>
): RetType => {
  const argsWasm = argsJS.map((arg) =>
    transformIntoWasmArg(module, fnName, arg)
  );
  const argsTypes = argsJS.map(
    (arg): WasmBasicTypeName => (typeof arg === 'string' ? 'string' : 'number')
  );

  const result = module.ccall(fnName, returnTypeName, argsTypes, argsWasm);

  argsJS.forEach((arg, i) => {
    let wasmHeapAddr = argsWasm[i];
    if (
      typeof arg === 'number' ||
      typeof arg === 'string' ||
      typeof wasmHeapAddr === 'string'
    )
      return;
    if (arg.inout !== 'out') return;

    // copy back from wasm's heap to JS TypedArray
    const heap = getMemoryHeapForJsArray(arg.arr)!;
    // console.log(`${fnName} HEAP`, module[heap]);
    wasmHeapAddr = wasmHeapAddr / arg.arr.BYTES_PER_ELEMENT; // convert to emscripten
    const length = arg.arr.length;
    arg.arr.set(module[heap].subarray(wasmHeapAddr, wasmHeapAddr + length));
  });

  return result;
};
