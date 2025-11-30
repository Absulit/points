const vert = /*wgsl*/`

struct Variable{
    init: i32
}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;
