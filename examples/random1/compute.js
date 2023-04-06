const compute = /*wgsl*/`

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let r = params.randNumber;
    let r2 = params.randNumber2;

    textureStore(outputTex, vec2<u32>( u32(r * 800.) ,  u32(r2 * 800.) ), vec4<f32>(1, params.sliderA,0,1));
}
`;

export default compute;
