// DO NOT ADD IMPORTS TO '*.d.ts' files!
// https://stackoverflow.com/a/51114250

declare namespace metis {
  type IdxPtr = WasmPtr; // Int32Array;
  type RealPtr = WasmPtr; // Float32Array;

  /**
   * METIS_PartGraphKway
   *
   * See metis manual, page 26.
   * Returns error code!
   *
   * https://github.com/KarypisLab/METIS/blob/e0f1b88b8efcb24ffa0ec55eabb78fbe61e58ae7/libmetis/kmetis.c#L18
   *
   * UE5:
   * https://github.com/EpicGames/UnrealEngine/blob/ue5-main/Engine/Source/Developer/NaniteBuilder/Private/GraphPartitioner.cpp#L56
   */
  export function METIS_PartGraphKway(
    // The number of vertices in the graph.
    nvtxs: IdxPtr, // idx_t *nvtxs,
    // The number of balancing constraints. It should be at least 1.
    ncon: IdxPtr, // idx_t *ncon,
    // The adjacency structure of the graph as described in Section 5.5.
    xadj: IdxPtr, // idx_t *xadj,
    // The adjacency structure of the graph as described in Section 5.5.
    adjncy: IdxPtr, // idx_t *adjncy,
    // The weights of the vertices as described in Section 5.5
    vwgt: IdxPtr | null, // idx_t *vwgt,
    // The size of the vertices for computing the total communication volume as described in Section 5.7.
    vsize: IdxPtr | null, // idx_t *vsize,
    // The weights of the edges as described in Section 5.5
    adjwgt: IdxPtr | null, // idx_t *adjwgt,
    // The number of parts to partition the graph
    nparts: IdxPtr, // idx_t *nparts,
    // This is an array of size nparts×ncon that specifies the desired weight
    // for each partition and constraint.
    // The target partition weight for the ith partition and jth constraint is specified at tpwgts[i*ncon+j]
    // (the numbering for both partitions and constraints starts from 0).
    // For each constraint, the sum of the tpwgts[] entries must be 1.0.
    //
    // A NULL value can be passed to indicate that the graph should be equally divided among the partitions.
    tpwgts: RealPtr | null, // real_t *tpwgts,
    // This is an array of size ncon that specifies the allowed load imbalance tolerance for each constraint.
    // For the ith partition and jth constraint the allowed weight is the ubvec[j]*tpwgts[i*ncon+j] fraction of the jth’s constraint total weight.
    // The load imbalances must be greater than 1.0.
    //
    // A NULL value can be passed indicating that the load imbalance tolerance for each constraint should be 1.001 (for ncon=1) or 1.01 (for ncon¿1)
    ubvec: RealPtr | null, // real_t *ubvec,
    // OPTION flags, see other files
    options: IdxPtr | null, // idx_t *options,
    // Upon successful completion, this variable stores the edge-cut or he total communication volume of the partitioning solution. The value returned depends on the partitioning’s objective function.
    objval: IdxPtr, // idx_t *objval,
    // This is a vector of size nvtxs that upon successful completion stores the partition vector of the graph. The numbering of this vector starts from either 0 or 1, depending on the value of options[METIS OPTION NUMBERING].
    part: IdxPtr // idx_t *part
  ): number;
}
