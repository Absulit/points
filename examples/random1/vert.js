const vert = /*wgsl*/`

struct Star{
    a: f32,
    b: f32,
    c: f32,
    d: f32,
}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

export default vert;