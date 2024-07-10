import { vec3 } from 'wgpu-matrix';
import { calcBoundingBox } from '../../utils/calcBounds.ts';
import { createGPUBuffer } from '../../utils/webgpu.ts';

/*
Based on:
- https://momentsingraphics.de/ToyRenderer2SceneManagement.html#Quantization
- https://github.com/MomentsInGraphics/vulkan_renderer/blob/38b1dc04ec3e67a311dad2f8e863eb070d076135/tools/io_export_vulkan_blender28.py#L481
- https://github.com/MomentsInGraphics/vulkan_renderer/blob/38b1dc04ec3e67a311dad2f8e863eb070d076135/src/scene.h#L56
*/

///////////////////////////
/// SHADER CODE
///////////////////////////

export const BUFFER_VERTEX_POSITIONS_QUANT = (
  bindingIdx: number
) => /* wgsl */ `

struct VertexPositionsQuant{
  dqFac: vec4f,
  dqSummand: vec4f,
  data: array<vec2u>,
}

@group(0) @binding(${bindingIdx})
// var<storage, read> _vertexPositions: array<vec2u>;
var<storage, read> _vertexPositionsQuant: VertexPositionsQuant;

/** get vertex position. Has .w=1 */
fn _getVertexPosition(idx: u32) -> vec4f {
  // let dequantFactor = _objectData.dequantFactor;
  // let dequantSummand = _objectData.dequantSummand;
  /*let dequantFactor = vec3f(
    5.918854526498762e-7, 5.862659691047156e-7, 4.5926591951683804e-7
  );
  let dequantSummand = vec3f(
    -0.755043089389801, 0.2664794921875, -0.4934331178665161
  );*/
  let dequantFactor = _vertexPositionsQuant.dqFac.xyz;
  let dequantSummand = _vertexPositionsQuant.dqSummand.xyz;
  let positionQuant = _vertexPositionsQuant.data[idx];

  let positionU32 = vec3u(
    positionQuant[0] & 0x1FFFFF,
    ((positionQuant[0] & 0xFFE00000) >> 21) | ((positionQuant[1] & 0x3FF) << 11),
    (positionQuant[1] >> 10) & 0x1FFFFF
  );
  let positionF32 = vec3f(positionU32) * dequantFactor + dequantSummand;
  return vec4f(positionF32.xyz, 1.0);
}
`;

///////////////////////////
/// GPU BUFFER
///////////////////////////

export function createNaniteVertexPositionsBuffer_Quant(
  device: GPUDevice,
  name: string,
  vertices: Float32Array
): GPUBuffer {
  const vertexCount = vertices.length / 3;
  // Quantization: calculate bounding box and split into 2**21 'places' per axis.
  // 3 axis * 21bytes = 63bytes for total vertex position.
  // The comments refer to Christoph Peters's
  // https://github.com/MomentsInGraphics/vulkan_renderer original code.
  const QUANT_PLACES = 2.0 ** 21.0;

  const [bboxMin, bboxMax] = calcBoundingBox(vertices);
  const bboxSpan = vec3.sub(bboxMax, bboxMin);
  // PY: quantization_factor = (2.0**21.0 / (box_max - box_min))
  const quantFactor = vec3.create(
    QUANT_PLACES / bboxSpan[0],
    QUANT_PLACES / bboxSpan[1],
    QUANT_PLACES / bboxSpan[2]
  );
  // PY: quantization_offset = -box_min * quantization_factor
  const quantOffset = vec3.mul(bboxMin, vec3.negate(quantFactor));

  const vertexPos = vec3.create();
  const quantVertPos = (x: number) => Math.floor(Math.min(x, QUANT_PLACES - 1));

  const dequantF32Count = 8; // 2 * vec4f
  const data = new Uint32Array(dequantF32Count + vertexCount * 2);

  for (let i = 0; i < vertexCount; i++) {
    vec3.set(
      vertices[i * 3],
      vertices[i * 3 + 1],
      vertices[i * 3 + 2],
      vertexPos
    );
    // PY: quantized_positions = np.asarray(mesh.vertex_position * quantization_factor + quantization_offset, dtype=np.uint32)
    vec3.mul(vertexPos, quantFactor, vertexPos);
    vec3.add(vertexPos, quantOffset, vertexPos);
    // PY: quantized_positions = np.minimum(2**21 - 1, quantized_positions)
    const vertexPosQuantX = quantVertPos(vertexPos[0]); // 21 bits
    const vertexPosQuantY = quantVertPos(vertexPos[1]); // 21 bits
    const vertexPosQuantZ = quantVertPos(vertexPos[2]); // 21 bits

    data[dequantF32Count + i * 2 + 0] = vertexPosQuantX;
    data[dequantF32Count + i * 2 + 0] += (vertexPosQuantY & 0x7ff) << 21; // write 11 bits of axis Y
    data[dequantF32Count + i * 2 + 1] = (vertexPosQuantY & 0x1ff800) >> 11; // write remaining 10 bits of axis Y to other u32
    data[dequantF32Count + i * 2 + 1] += vertexPosQuantZ << 10;
  }

  // PY: dequantization_factor = 1.0 / quantization_factor
  const dequantFactor = vec3.inverse(quantFactor); // we will revert the scaling
  // PY: box_min + 0.5 * quantFactor;
  const dequantSummand = vec3.addScaled(bboxMin, dequantFactor, 0.5);
  const dataAsF32 = new Float32Array(data.buffer, 0, 8);
  dataAsF32[0] = dequantFactor[0];
  dataAsF32[1] = dequantFactor[1];
  dataAsF32[2] = dequantFactor[2];
  dataAsF32[4] = dequantSummand[0];
  dataAsF32[5] = dequantSummand[1];
  dataAsF32[6] = dequantSummand[2];

  // provide both values to the WGSL's _getVertexPosition()
  // console.log({ dequantFactor, dequantSummand });

  return createGPUBuffer(
    device,
    `${name}-nanite-vertex-buffer-vec4`,
    GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
    data
  );
}
