const compute = /*wgsl*/`

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let time = params.time;
    _ = firstMatrix[0];
    _ = secondMatrix[0];
}
`;

export default compute;
