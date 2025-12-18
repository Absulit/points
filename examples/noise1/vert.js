const vert = /*wgsl*/`

struct Variable{
    valueNoiseCreated:f32,
}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;
