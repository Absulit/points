const compute = /*wgsl*/`

const SIZE = vec2u(800, 800);

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let grayscale = textureLoad(lpbReadTexture, GlobalId.xy, 0); // image


    textureStore(histogramWriteTexture, GlobalId.xy, grayscale);

}
`;

export default compute;
