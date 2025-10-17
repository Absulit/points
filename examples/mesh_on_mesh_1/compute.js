import { structs } from "./structs.js";

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let time = params.time;
}
`;

export default compute;
