import { structs } from "./structs.js";

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(THREADS_X,THREADS_Y,THREADS_Z)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
}
`;

export default compute;
