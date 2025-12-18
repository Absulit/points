const frag = /*wgsl*/`

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    return in.color;
}
`;

export default frag;
