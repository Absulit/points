const compute = /*wgsl*/`

struct Variable{
    init: f32,
    circleRadius:f32,
    circlePosition:vec2<f32>
}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let time = params.time;
}
`;

export default compute;
