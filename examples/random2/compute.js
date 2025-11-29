const compute = /*wgsl*/`

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {
    let dims = textureDimensions(feedbackTexture);

    //--------------------------------------------------

    let pointIndex = i32(in.GID.y + (in.GID.x * dims.x));
    let c = rands[pointIndex];

    textureStore(outputTex, in.GID.xy, vec4f(c));
    storageBarrier();
}
`;

export default compute;
