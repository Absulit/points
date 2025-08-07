const vert = /*wgsl*/`

struct Variable{
    init: f32,
    circleRadius:f32,
    circlePosition:vec2f
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

export default vert;
