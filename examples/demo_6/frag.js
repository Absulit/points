const frag = /*wgsl*/`

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f
) -> @location(0) vec4f {

    return color;
}
`;

export default frag;
