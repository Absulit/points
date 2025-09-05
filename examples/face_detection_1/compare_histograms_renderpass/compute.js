import { structs } from "../structs.js";

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    // histograms[GlobalId.x].data[GlobalId.y] = 0;

    // log_data[0] = f32(GlobalId.x);
    // log.updated = 1;

}
`;

export default compute;
