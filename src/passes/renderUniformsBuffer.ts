import { Mat4 } from 'wgpu-matrix';
import {
  BYTES_F32,
  BYTES_MAT4,
  BYTES_U32,
  BYTES_VEC4,
  CONFIG,
} from '../constants.ts';
import { GPU_BUFFER_USAGE_UNIFORM } from '../utils/webgpu.ts';
import { calcCotHalfFov } from './naniteCpu/calcNaniteMeshletsVisibility.ts';
import { PassCtx } from './passCtx.ts';

const FLAG_FRUSTUM_CULLING = 1;
const FLAG_OCCLUSION_CULLING = 2;
const FLAG_INSTANCES_FRUSTUM_CULLING = 1 << 5;
const FLAG_INSTANCES_OCCLUSION_CULLING = 1 << 6;
const FLAG_FORCE_BILLBOARDS = 1 << 16;

export class RenderUniformsBuffer {
  public static SHADER_SNIPPET = (group: number) => /* wgsl */ `
    const b11 = 3u; // binary 0b11
    const b111 = 7u; // binary 0b111
    const b1111 = 15u; // binary 0b1111
    const b11111 = 31u; // binary 0b11111
    const b111111 = 63u; // binary 0b111111

    struct Uniforms {
      vpMatrix: mat4x4<f32>,
      viewMatrix: mat4x4<f32>,
      projMatrix: mat4x4<f32>,
      viewport: vec4f,
      cameraPosition: vec4f,
      cameraFrustumPlane0: vec4f, // TODO [LOW] there are much more efficient ways for frustum culling
      cameraFrustumPlane1: vec4f, // https://github.com/zeux/niagara/blob/master/src/shaders/drawcull.comp.glsl#L72
      cameraFrustumPlane2: vec4f,
      cameraFrustumPlane3: vec4f,
      cameraFrustumPlane4: vec4f,
      cameraFrustumPlane5: vec4f,
      // b1 - frustom cull
      // b2 - occlusion cull (ends at: 1 << 1)
      // b3,4,5 - shading mode (1 << 2 to 1 << 4)
      // b6,7 - instances culling (1 << 5, 1 << 6)
      // b8,9,10,11 - debug render depty pyramid level (value 0-15)
      // b12,13,14,15 - debug override occlusion cull depth mipmap (value 0-15). 0b1111 means OFF
      // b16 - force billboards
      // b17,b18,b19,b20,b21,b22 - billboard dithering
      // b23..32 - not used
      flags: u32,
      billboardThreshold: f32,
      padding0: u32,
      padding1: u32,
    };
    @binding(0) @group(${group})
    var<uniform> _uniforms: Uniforms;

    fn checkFlag(flags: u32, bit: u32) -> bool { return (flags & bit) > 0; }
    fn useFrustumCulling(flags: u32) -> bool { return checkFlag(flags, ${FLAG_FRUSTUM_CULLING}u); }
    fn useOcclusionCulling(flags: u32) -> bool { return checkFlag(flags, ${FLAG_OCCLUSION_CULLING}u); }
    fn useInstancesFrustumCulling(flags: u32) -> bool { return checkFlag(flags, ${FLAG_INSTANCES_FRUSTUM_CULLING}u); }
    fn useInstancesOcclusionCulling(flags: u32) -> bool { return checkFlag(flags, ${FLAG_INSTANCES_OCCLUSION_CULLING}u); }
    fn useForceBillboards(flags: u32) -> bool { return checkFlag(flags, ${FLAG_FORCE_BILLBOARDS}u); }
    fn getShadingMode(flags: u32) -> u32 {
      return (flags >> 2u) & b111;
    }
    fn getDbgPyramidMipmapLevel(flags: u32) -> i32 {
      return i32(clamp((flags >> 8u) & b1111, 0u, 15u));
    }
    fn getOverrideOcclusionCullMipmap(flags: u32) -> i32 {
      let v: u32 = clamp((flags >> 12u) & b1111, 0u, 15u);
      if (v == 15u) { return -1; }
      return i32(v);
    }
    fn getBillboardDitheringStrength(flags: u32) -> f32 {
      let v: u32 = (flags >> 17u) & b111111; // [0-64]
      return f32(v) / 63.0;
    }
  `;

  public static BUFFER_SIZE =
    BYTES_MAT4 + // vpMatrix
    BYTES_MAT4 + // viewMatrix
    BYTES_MAT4 + // projMatrix
    BYTES_VEC4 + // viewport
    BYTES_VEC4 + // cameraPosition
    6 * BYTES_VEC4 + // camera frustum planes
    4 * BYTES_U32; // flags + padding

  private readonly gpuBuffer: GPUBuffer;
  private readonly data = new ArrayBuffer(RenderUniformsBuffer.BUFFER_SIZE);
  private readonly dataAsF32: Float32Array;
  private readonly dataAsU32: Uint32Array;

  constructor(device: GPUDevice) {
    this.gpuBuffer = device.createBuffer({
      label: 'render-uniforms-buffer',
      size: RenderUniformsBuffer.BUFFER_SIZE,
      usage: GPU_BUFFER_USAGE_UNIFORM,
    });
    this.dataAsF32 = new Float32Array(this.data);
    this.dataAsU32 = new Uint32Array(this.data);
  }

  createBindingDesc = (bindingIdx: number): GPUBindGroupEntry => ({
    binding: bindingIdx,
    resource: { buffer: this.gpuBuffer },
  });

  update(ctx: PassCtx) {
    const {
      device,
      vpMatrix,
      viewMatrix,
      projMatrix,
      viewport,
      cameraFrustum,
      cameraPositionWorldSpace,
    } = ctx;
    const c = CONFIG;
    const nanite = c.nanite.render;
    const imp = c.impostors;

    let offsetBytes = 0;
    offsetBytes = this.writeMat4(offsetBytes, vpMatrix);
    offsetBytes = this.writeMat4(offsetBytes, viewMatrix);
    offsetBytes = this.writeMat4(offsetBytes, projMatrix);
    // viewport
    offsetBytes = this.writeF32(offsetBytes, viewport.width);
    offsetBytes = this.writeF32(offsetBytes, viewport.height);
    offsetBytes = this.writeF32(offsetBytes, nanite.pixelThreshold); // prettier-ignore
    offsetBytes = this.writeF32(offsetBytes, calcCotHalfFov());
    // camera position
    const camPos = cameraPositionWorldSpace;
    offsetBytes = this.writeF32(offsetBytes, camPos[0]);
    offsetBytes = this.writeF32(offsetBytes, camPos[1]);
    offsetBytes = this.writeF32(offsetBytes, camPos[2]);
    offsetBytes = this.writeF32(offsetBytes, 0.0); // padding
    // camera frustum planes
    for (let i = 0; i < cameraFrustum.planes.length; i++) {
      offsetBytes = this.writeF32(offsetBytes, cameraFrustum.planes[i]);
    }
    // misc
    offsetBytes = this.writeU32(offsetBytes, this.encodeFlags());
    offsetBytes = this.writeF32(offsetBytes, imp.billboardThreshold);
    // padding
    offsetBytes += 2 * BYTES_U32;

    // final write
    if (offsetBytes !== RenderUniformsBuffer.BUFFER_SIZE) {
      throw new Error(`Invalid write to RenderUniformsBuffer. Buffer has ${RenderUniformsBuffer.BUFFER_SIZE}bytes, but tried to write ${offsetBytes} bytes.`); // prettier-ignore
    }
    device.queue.writeBuffer(this.gpuBuffer, 0, this.data, 0, offsetBytes);
  }

  private writeMat4(offsetBytes: number, mat: Mat4) {
    const offset = offsetBytes / BYTES_F32;
    for (let i = 0; i < 16; i++) {
      this.dataAsF32[offset + i] = mat[i];
    }
    return offsetBytes + BYTES_MAT4;
  }

  private writeF32(offsetBytes: number, v: number) {
    const offset = offsetBytes / BYTES_F32;
    this.dataAsF32[offset] = v;
    return offsetBytes + BYTES_F32;
  }

  private writeU32(offsetBytes: number, v: number) {
    const offset = offsetBytes / BYTES_U32;
    this.dataAsU32[offset] = Math.floor(v);
    return offsetBytes + BYTES_U32;
  }

  private encodeFlags() {
    const naniteCfg = CONFIG.nanite.render;
    const ci = CONFIG.cullingInstances;
    const imp = CONFIG.impostors;

    let flags = 0;
    const setFlag = (bit: number, b: boolean) => {
      flags = flags | (b ? bit : 0);
    };

    // frustum cull
    setFlag(FLAG_FRUSTUM_CULLING, naniteCfg.useFrustumCulling);

    // occlusion culling: skip if we don't have depth pyramid yet
    const occlCull =
      naniteCfg.hasValidDepthPyramid && naniteCfg.useOcclusionCulling;
    setFlag(FLAG_OCCLUSION_CULLING, occlCull);

    // b3,4 - shading mode
    let bits = naniteCfg.shadingMode & 0b111;
    flags = flags | (bits << 2);

    setFlag(FLAG_INSTANCES_FRUSTUM_CULLING, ci.frustumCulling);
    setFlag(FLAG_INSTANCES_OCCLUSION_CULLING, ci.occlusionCulling);

    // dbgDepthPyramidLevel
    bits = CONFIG.dbgDepthPyramidLevel & 0b1111;
    flags = flags | (bits << 8);

    // occlusionCullOverrideMipmapLevel
    bits = naniteCfg.isOverrideOcclusionCullMipmap
      ? naniteCfg.occlusionCullOverrideMipmapLevel & 0b1111
      : 0b1111;
    flags = flags | (bits << 12);

    // BILLBOARDS
    setFlag(FLAG_FORCE_BILLBOARDS, imp.forceOnlyBillboards);
    bits = Math.floor(imp.ditherStrength * 63);
    flags = flags | (bits << 17);

    return flags;
  }
}
