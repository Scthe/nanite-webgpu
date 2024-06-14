import { BYTES_U32, CONFIG } from '../../constants.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import { applyShaderTextReplace } from '../../utils/webgpu.ts';
import { assertHasShaderCode, assignResourcesToBindings } from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';

const BINDINGS_RENDER_UNIFORMS = 0;
const BINDINGS_MESHLETS = 1;
const BINDINGS_MESHLET_IDS = 2;
const BINDINGS_DRAW_INDIRECT_PARAMS = 3;
const BINDINGS_INSTANCES_TRANSFORMS = 4;

export const SHADER_SNIPPET_MESHLET_TREE_NODES = (bindingIdx: number) => `
struct NaniteMeshletTreeNode {
  boundsMidPointAndError: vec4f, // bounds.xyz + maxSiblingsError
  parentBoundsMidPointAndError: vec4f, // parentBounds.xyz + parentError
  id: u32, // TODO not needed, it's just dispatchId.x?
  triangleCount: u32,
  firstIndexOffset: u32,
  padding0: u32
}
@group(0) @binding(${bindingIdx})
var<storage, read> _meshlets: array<NaniteMeshletTreeNode>;
`;

export const SHADER_SNIPPET_DRAWN_MESHLETS_LIST = (
  bindingIdx: number,
  access: 'read_write' | 'read'
) => `
@group(0) @binding(${bindingIdx})
var<storage, ${access}> _drawnMeshletIds: array<vec2<u32>>;
`;

export class NaniteVisibilityPass {
  public static NAME: string = NaniteVisibilityPass.name;
  public static SHADER_CODE: string = '';

  private readonly pipeline: GPUComputePipeline;
  private readonly uniformsBindings: GPUBindGroup;
  public readonly drawIndirectParamsBuffer: GPUBuffer; // TODO make part of NaniteObject. Create NaniteObject.bindIndirectParams(idx)

  constructor(
    device: GPUDevice,
    uniforms: RenderUniformsBuffer,
    naniteObject: NaniteObject
  ) {
    assertHasShaderCode(NaniteVisibilityPass);
    this.pipeline = NaniteVisibilityPass.createPipeline(device);

    this.drawIndirectParamsBuffer = device.createBuffer({
      label: `${NaniteVisibilityPass}-drawIndirect-params`,
      size: 4 * BYTES_U32,
      usage:
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.INDIRECT |
        GPUBufferUsage.COPY_SRC | // TODO only needed for tests. Can slow down in prod
        GPUBufferUsage.COPY_DST,
    });

    this.uniformsBindings = assignResourcesToBindings(
      NaniteVisibilityPass,
      device,
      this.pipeline,
      [
        uniforms.createBindingDesc(BINDINGS_RENDER_UNIFORMS),
        {
          binding: BINDINGS_MESHLETS,
          resource: { buffer: naniteObject.meshletsBuffer },
        },
        {
          binding: BINDINGS_MESHLET_IDS,
          resource: { buffer: naniteObject.visiblityBuffer },
        },
        {
          binding: BINDINGS_DRAW_INDIRECT_PARAMS, // TODO this should be a small slice of $naniteObject.visiblityBuffer
          resource: { buffer: this.drawIndirectParamsBuffer },
        },
        {
          binding: BINDINGS_INSTANCES_TRANSFORMS,
          resource: { buffer: naniteObject.instances.transformsBuffer },
        },
      ]
    );
  }

  private static createPipeline(device: GPUDevice) {
    let code = `
${RenderUniformsBuffer.SHADER_SNIPPET(BINDINGS_RENDER_UNIFORMS)}
${SHADER_SNIPPET_MESHLET_TREE_NODES(BINDINGS_MESHLETS)}
${SHADER_SNIPPET_DRAWN_MESHLETS_LIST(BINDINGS_MESHLET_IDS, 'read_write')}
${SHADER_SNIPPETS.GET_MVP_MAT}
${NaniteVisibilityPass.SHADER_CODE}
      `;
    code = applyShaderTextReplace(code, {
      __MAX_MESHLET_TRIANGLES: `${CONFIG.nanite.preprocess.meshletMaxTriangles}u`,
    });
    const shaderModule = device.createShaderModule({ code });
    return device.createComputePipeline({
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  cmdCalculateVisibility(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;

    // zeroe the whole buffer
    cmdBuf.clearBuffer(
      this.drawIndirectParamsBuffer,
      0,
      this.drawIndirectParamsBuffer.size
    );

    const computePass = cmdBuf.beginComputePass({
      timestampWrites: profiler?.createScopeGpu(NaniteVisibilityPass.NAME),
    });
    computePass.setPipeline(this.pipeline);
    computePass.setBindGroup(0, this.uniformsBindings);
    computePass.dispatchWorkgroups(
      naniteObject.meshletCount,
      naniteObject.instancesCount
    );
    computePass.end();
  }
}
