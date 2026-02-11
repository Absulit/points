const frag = /*wgsl*/`

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let finalColor = vec4f(.2);

    return finalColor;
}
`;

export default frag;
