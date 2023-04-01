const compute = /*wgsl*/`

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let dims: vec2<u32> = textureDimensions(feedbackTexture, 0);
    var rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2(0),  0.0).rgba;


    for(var i:u32; i< 800*800; i++){
        let x = i % 800;
        let y = i / 800;
        let c = rands[i];
        textureStore(outputTex, vec2<u32>( u32(x) ,  u32(y) ), vec4<f32>(c));
    }
}
`;

export default compute;
