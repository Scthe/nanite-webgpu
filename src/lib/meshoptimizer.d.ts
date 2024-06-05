declare namespace meshoptimizer {
  type U32Ptr = WasmPtr;
  type F32Ptr = WasmPtr;
  type SizeT = number;

  /** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L201 */
  export function meshopt_generateVertexRemap(
    destination: U32Ptr, // unsigned int* destination,
    indices: U32Ptr, // const unsigned int* indices,
    index_count: SizeT, // size_t index_count,
    vertices: F32Ptr, // const void* vertices,
    vertex_count: SizeT, // size_t vertex_count,
    vertex_size: SizeT // size_t vertex_size
  ): number;

  /** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L341 */
  export function meshopt_remapIndexBuffer(
    destination: U32Ptr, // unsigned int* destination,
    indices: U32Ptr, // const unsigned int* indices,
    index_count: SizeT, // size_t index_count,
    remap: U32Ptr // const unsigned int* remap
  ): void;

  /** https://github.com/zeux/meshoptimizer/blob/3c3e56d312cbe7d5929c78401de2124c7be3bc07/src/indexgenerator.cpp#L305 */
  export function meshopt_remapVertexBuffer(
    destination: F32Ptr, // const void* destination,
    vertices: F32Ptr, // const void* vertices,
    vertex_count: SizeT, // size_t vertex_count,
    vertex_size: SizeT, // size_t vertex_size,
    remap: U32Ptr // const unsigned int* remap
  ): void;
}
