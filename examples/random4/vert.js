const vert = /*wgsl*/`

struct Star{
    a: f32,
    b: f32,
    c: f32,
    d: f32,
}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;