import { CONFIG } from '../../constants.ts';
import { NaniteObject } from '../../scene/naniteObject.ts';
import { applyShaderTextReplace } from '../../utils/webgpu.ts';
import {
  BindingsCache,
  assertHasShaderCode,
  assignResourcesToBindings2,
  labelPipeline,
  labelShader,
} from '../_shared.ts';
import { PassCtx } from '../passCtx.ts';
import { RenderUniformsBuffer } from '../renderUniformsBuffer.ts';
import * as SHADER_SNIPPETS from '../_shaderSnippets.ts';

const BINDINGS_RENDER_UNIFORMS = 0;
const BINDINGS_MESHLETS = 1;
const BINDINGS_DRAWN_MESHLET_IDS = 2;
const BINDINGS_DRAW_INDIRECT_PARAMS = 3;
const BINDINGS_INSTANCES_TRANSFORMS = 4;

export const SHADER_SNIPPET_MESHLET_TREE_NODES = (bindingIdx: number) => `
struct NaniteMeshletTreeNode {
  boundsMidPointAndError: vec4f, // bounds.xyz + maxSiblingsError
  parentBoundsMidPointAndError: vec4f, // parentBounds.xyz + parentError
  triangleCount: u32,
  firstIndexOffset: u32,
  padding0: u32, // required to fill uvec4
  padding1: u32, // required to fill uvec4
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
  private readonly bindingsCache = new BindingsCache();

  constructor(device: GPUDevice) {
    assertHasShaderCode(NaniteVisibilityPass);
    this.pipeline = NaniteVisibilityPass.createPipeline(device);
  }

  private static createPipeline(device: GPUDevice) {
    let code = `
${RenderUniformsBuffer.SHADER_SNIPPET(BINDINGS_RENDER_UNIFORMS)}
${SHADER_SNIPPET_MESHLET_TREE_NODES(BINDINGS_MESHLETS)}
${SHADER_SNIPPET_DRAWN_MESHLETS_LIST(BINDINGS_DRAWN_MESHLET_IDS, 'read_write')}
${SHADER_SNIPPETS.GET_MVP_MAT}
${NaniteVisibilityPass.SHADER_CODE}
      `;
    code = applyShaderTextReplace(code, {
      __MAX_MESHLET_TRIANGLES: `${CONFIG.nanite.preprocess.meshletMaxTriangles}u`,
      __BINDINGS_DRAW_INDIRECT_PARAMS: String(BINDINGS_DRAW_INDIRECT_PARAMS),
      __BINDINGS_INSTANCES_TRANSFORMS: String(BINDINGS_INSTANCES_TRANSFORMS),
    });

    const shaderModule = device.createShaderModule({
      label: labelShader(NaniteVisibilityPass),
      code,
    });
    return device.createComputePipeline({
      label: labelPipeline(NaniteVisibilityPass),
      layout: 'auto',
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    });
  }

  cmdCalculateVisibility(ctx: PassCtx, naniteObject: NaniteObject) {
    const { cmdBuf, profiler } = ctx;
    const bindings = this.bindingsCache.getBindings(naniteObject.name, () =>
      this.createBindings(ctx, naniteObject)
    );

    naniteObject.cmdClearDrawParams(cmdBuf);

    const computePass = cmdBuf.beginComputePass({
      timestampWrites: profiler?.createScopeGpu(NaniteVisibilityPass.NAME),
    });
    computePass.setPipeline(this.pipeline);
    computePass.setBindGroup(0, bindings);
    computePass.dispatchWorkgroups(
      naniteObject.meshletCount,
      naniteObject.instancesCount
    );
    computePass.end();
  }

  private createBindings = (
    { device, globalUniforms }: PassCtx,
    naniteObject: NaniteObject
  ): GPUBindGroup => {
    return assignResourcesToBindings2(
      NaniteVisibilityPass,
      naniteObject.name,
      device,
      this.pipeline,
      [
        globalUniforms.createBindingDesc(BINDINGS_RENDER_UNIFORMS),
        naniteObject.bufferBindingMeshlets(BINDINGS_MESHLETS),
        naniteObject.bufferBindingVisibility(BINDINGS_DRAWN_MESHLET_IDS),
        naniteObject.bufferBindingIndirectDrawParams(
          BINDINGS_DRAW_INDIRECT_PARAMS
        ),
        naniteObject.bufferBindingInstanceTransforms(
          BINDINGS_INSTANCES_TRANSFORMS
        ),
      ]
    );
  };
}
