import defaultStructs from '../../src/shaders/defaultStructs.js';

const compute = /*wgsl*/`

${defaultStructs}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    _ = params.utime;
}
`;

export default compute;
