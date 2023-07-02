const compute = /*wgsl*/`

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let dims = textureDimensions(feedbackTexture);

    //--------------------------------------------------

    let pointIndex = i32(GlobalId.y + (GlobalId.x * dims.x));
    let c = rands[pointIndex];

    textureStore(outputTex, GlobalId.xy, vec4<f32>(c));
    storageBarrier();
}
`;

export default compute;
