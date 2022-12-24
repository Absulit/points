import defaultStructs from '../defaultStructs.js';

const layers1Compute = /*wgsl*/`

${defaultStructs}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    _ = points[0];
}
`;

export default layers1Compute;
