import { TypedArray } from './webgpu.ts';

type WasmPtrInout = 'in' | 'out';

/** This struct is only needed to know we need to copy back data from wasm's heap.
 * https://gamedev.stackexchange.com/questions/29672/in-out-keywords-in-glsl
 */
type WasmPtr = {
  arr: WasmArray;
  inout: WasmPtrInout;
};

type WasmArray = Float32Array | Uint32Array | Uint8Array;
type WasmHeap = 'HEAPF32' | 'HEAPU32' | 'HEAPU8';
type WasmBasicTypeName = 'number' | 'string' | 'array';
type WasmBasicType = number | string | WasmPtr;

type WasmHeapAdr = number;

type WasmModuleWithHeaps = Record<WasmHeap, TypedArray>;

// Monkey patch with emscripten
declare namespace WebAssembly {
  interface Module extends WasmModuleWithHeaps {
    ccall(
      fnName: string,
      returnTypeName: WasmBasicTypeName,
      argsTypes: string[],
      argsWasm: any[]
    );
    _malloc(bytesCnt: number): WasmHeapAdr;
  }
}
