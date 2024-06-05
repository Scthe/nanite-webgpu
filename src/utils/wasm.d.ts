type WasmPtrInout = 'in' | 'out';

/** This struct is only needed to know we need to copy back data from wasm's heap.
 * https://gamedev.stackexchange.com/questions/29672/in-out-keywords-in-glsl
 */
type WasmPtr = {
  arr: WasmArray;
  inout: WasmPtrInout;
};

type WasmArray = Float32Array | Uint32Array;
type WasmHeap = 'HEAPF32' | 'HEAPU32';
type WasmBasicTypeName = 'number' | 'string' | 'array';
type WasmBasicType = number | string | WasmPtr;

type WasmHeapAdr = number;

// Monkey patch with emscripten
declare namespace WebAssembly {
  interface Module {
    ccall(
      fnName: string,
      returnTypeName: WasmBasicTypeName,
      argsTypes: string[],
      argsWasm: any[]
    );
    _malloc(bytesCnt: number): WasmHeapAdr;
  }
}
