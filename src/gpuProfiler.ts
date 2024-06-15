import { BYTES_U64, NANO_TO_MILISECONDS } from './constants.ts';

/// Big amount of queries to never have to carry about it
const MAX_QUERY_COUNT = 1024;
/// Each pass has BEGIN and END timestamp query
const QUERIES_PER_PASS = 2;
const TOTAL_MAX_QUERIES = MAX_QUERY_COUNT * QUERIES_PER_PASS;

type GpuProfilerResultItem = [string, number];
export type GpuProfilerResult = Array<[string, number]>;

export type ProfilerRegionId = number | undefined;

export const getProfilerTimestamp = () => performance.now();

export const getDeltaFromTimestampMS = (start: number) => {
  const end = getProfilerTimestamp();
  return end - start;
};

/**
 * https://github.com/Scthe/Rust-Vulkan-TressFX/blob/master/src/gpu_profiler.rs
 *
 * webgpu API: https://webgpufundamentals.org/webgpu/lessons/webgpu-timing.html
 */
export class GpuProfiler {
  private _profileThisFrame = false;
  private readonly hasRequiredFeature: boolean;
  private readonly queryPool: GPUQuerySet;
  private readonly queryInProgressBuffer: GPUBuffer;
  private readonly resultsBuffer: GPUBuffer;

  private currentFrameScopes: Array<[string, 'cpu' | 'gpu', number]> = [];

  get enabled() {
    return this._profileThisFrame && this.hasRequiredFeature;
  }

  constructor(device: GPUDevice) {
    this.hasRequiredFeature = device.features.has('timestamp-query');
    if (!this.hasRequiredFeature) {
      // we should never use them if no feature available
      this.queryPool = undefined!;
      this.queryInProgressBuffer = undefined!;
      this.resultsBuffer = undefined!;
      return;
    }

    this.queryPool = device.createQuerySet({
      type: 'timestamp',
      count: TOTAL_MAX_QUERIES,
    });

    this.queryInProgressBuffer = device.createBuffer({
      label: 'profiler-in-progress',
      size: this.queryPool.count * BYTES_U64,
      usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
    });
    this.resultsBuffer = device.createBuffer({
      label: 'profiler-results',
      size: this.queryInProgressBuffer.size,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
    });
  }

  profileNextFrame(enabled: boolean) {
    this._profileThisFrame = enabled;
  }

  beginFrame() {
    while (this.currentFrameScopes.length > 0) {
      this.currentFrameScopes.pop();
    }
  }

  endFrame(cmdBuf: GPUCommandEncoder) {
    if (!this.enabled) {
      return;
    }

    const queryCount = this.currentFrameScopes.length * QUERIES_PER_PASS;
    cmdBuf.resolveQuerySet(
      this.queryPool,
      0,
      queryCount,
      this.queryInProgressBuffer,
      0
    );
    if (this.resultsBuffer.mapState === 'unmapped') {
      cmdBuf.copyBufferToBuffer(
        this.queryInProgressBuffer,
        0,
        this.resultsBuffer,
        0,
        this.resultsBuffer.size
      );
    }
  }

  async scheduleRaportIfNeededAsync(onResult?: (e: GpuProfilerResult) => void) {
    if (!this.enabled || this.currentFrameScopes.length == 0) {
      this._profileThisFrame = false;
      return;
    }

    this._profileThisFrame = false;
    const scopeNames = this.currentFrameScopes.slice();

    if (this.resultsBuffer.mapState === 'unmapped') {
      await this.resultsBuffer.mapAsync(GPUMapMode.READ);
      const times = new BigInt64Array(this.resultsBuffer.getMappedRange());
      const result = scopeNames.map(
        ([name, type, cpuTime], idx): GpuProfilerResultItem => {
          let time = 0;
          if (type === 'gpu') {
            const start = times[idx * QUERIES_PER_PASS];
            const end = times[idx * QUERIES_PER_PASS + 1];
            time = Number(end - start) * NANO_TO_MILISECONDS;
          } else {
            time = cpuTime;
          }
          return [name, time];
        }
      );
      this.resultsBuffer.unmap();

      onResult?.(result);
    }
  }

  /** Provide to beginCompute/beginRenderPass's `timestampWrites` */
  createScopeGpu(name: string): GPURenderPassTimestampWrites | undefined {
    if (!this.enabled) {
      return undefined;
    }

    const queryId = this.currentFrameScopes.length;
    this.currentFrameScopes.push([name, 'gpu', 0]);

    return {
      querySet: this.queryPool,
      beginningOfPassWriteIndex: queryId * QUERIES_PER_PASS,
      endOfPassWriteIndex: queryId * QUERIES_PER_PASS + 1,
    };
  }

  /*
  NOTE: The geniuses actually removed this feature... WTF?!

  /**If you want to start/end code block manually * /
  startRegionGpu(cmdBuf: GPUCommandEncoder, name: string): ProfilerRegionId {
    if (!this.enabled) {
      return undefined;
    }

    const queryId = this.currentFrameScopes.length;
    this.currentFrameScopes.push([name, 'gpu', 0]);
    cmdBuf.writeTimestamp(this.queryPool, queryId * 2);

    return queryId;
  }

  endRegionGpu(cmdBuf: GPUCommandEncoder, token: ProfilerRegionId) {
    if (!this.enabled || token === undefined) return;

    cmdBuf.writeTimestamp(this.queryPool, token * 2 + 1);
  }
  */

  startRegionCpu(name: string): ProfilerRegionId {
    if (!this.enabled) {
      return undefined;
    }

    const queryId = this.currentFrameScopes.length;
    const now = performance.now();
    this.currentFrameScopes.push([name, 'cpu', now]);
    return queryId;
  }

  endRegionCpu(token: ProfilerRegionId) {
    if (!this.enabled || token === undefined) return;

    const el = this.currentFrameScopes[token];
    if (el) {
      const [_, _2, start] = el;
      el[2] = getDeltaFromTimestampMS(start);
    }
  }
}
