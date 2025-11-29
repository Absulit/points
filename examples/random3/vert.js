const vert = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> FragmentIn {

    return defaultVertexBody(position, color, uv, normal);
}
`;

export default vert;