const compute = /*wgsl*/`

@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {
    let r = params.randPosition;

    textureStore(
        outputTex,
        vec2u(r * 800.), vec4f(1, params.sliderA, 0, 1)
    );
}
`;

export default compute;
