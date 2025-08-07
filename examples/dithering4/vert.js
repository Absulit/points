const vert = /*wgsl*/`


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
