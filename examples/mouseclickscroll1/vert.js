const vert = /*wgsl*/`

// TODO: 1262 how to remove this from vertex shader
// please check TODO: 1262

struct Variable{
    init: f32,
    circleRadius:f32,
    circlePosition:vec2f
}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;
