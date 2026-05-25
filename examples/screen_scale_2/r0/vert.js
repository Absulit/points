const vert = /*wgsl*/`

/**
 * VertexIn
 * position: vec4f,
 * color: vec4f,
 * uv: vec2f,
 * normal: vec3f,
 * id: u32,       // mesh id
 * vertexIndex: u32,
 * instanceIndex: u32,
 */
@vertex
fn main(in: VertexIn) -> FragmentIn {
    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;
