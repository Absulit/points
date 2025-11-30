import { structs } from "../structs.js";

const compute = /*wgsl*/`

${structs}

// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(THREADS_X,THREADS_Y,THREADS_Z)
fn main(in: ComputeIn) {
    let time = params.time;
}
`;

export default compute;
