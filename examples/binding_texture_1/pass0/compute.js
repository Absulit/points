const compute = /*wgsl*/`

@compute @workgroup_size(1,1,1)
fn main(in: ComputeIn) {
    textureStore(writeTexture, vec2u( vec2f(GlobalId.xy) * .2), vec4f(1.,0,0,1));

    textureStore(a, vec2u( vec2f(GlobalId.xy) * .3), vec4f(1.,1.,0,1));
}
`;

export default compute;
