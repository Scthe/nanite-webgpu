// DO NOT ADD IMPORTS TO '*.d.ts' files!
// https://stackoverflow.com/a/51114250

type TypedArray = Float32Array | Uint8Array | Uint32Array;

type WasmPtrInout = 'in' | 'out';

/** This struct is only needed to know we need to copy back data from wasm's heap.
 * https://gamedev.stackexchange.com/questions/29672/in-out-keywords-in-glsl
 */
type WasmPtr = {
  arr: WasmArray;
  inout: WasmPtrInout;
};

type WasmArray = Float32Array | Uint32Array | Int32Array | Uint8Array;
type WasmHeap = 'HEAPF32' | 'HEAPU32' | 'HEAP32' | 'HEAPU8';
type WasmBasicTypeName = 'number' | 'string' | 'array';
type WasmBasicType = number | string | WasmPtr | null;

type WasmHeapAdr = number;

type WasmModuleWithHeaps = Record<WasmHeap, TypedArray>;

// Monkey patch with emscripten
// declare namespace WebAssembly {
interface WasmModule extends WasmModuleWithHeaps, WebAssembly.Module {
  ccall(
    fnName: string,
    returnTypeName: WasmBasicTypeName,
    argsTypes: string[],
    argsWasm: WasmBasicType[]
    // deno-lint-ignore no-explicit-any
  ): any;
  _malloc(bytesCnt: number): WasmHeapAdr;
  _create_buffer(bytesCnt: number): WasmHeapAdr;
}
// }
