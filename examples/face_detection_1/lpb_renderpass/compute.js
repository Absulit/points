const compute = /*wgsl*/`

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let grayscale = textureLoad(grayscalePassTexture, GlobalId.xy, 0); // image

    textureStore(writeTexture, GlobalId.xy, 1 - grayscale);

}
`;

export default compute;
