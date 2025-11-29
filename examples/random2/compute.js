const compute = /*wgsl*/`

const workgroupSize = 8;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {
    let dims = textureDimensions(feedbackTexture);

    //--------------------------------------------------

    let pointIndex = i32(GlobalId.y + (GlobalId.x * dims.x));
    let c = rands[pointIndex];

    textureStore(outputTex, GlobalId.xy, vec4f(c));
    storageBarrier();
}
`;

export default compute;
