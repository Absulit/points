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

    let world = (/*model * */ vec4f(in.position.xyz, 1.)).xyz;
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);



    return defaultVertexBody(clip, in.color, in.uv, in.normal);
}
`;

export default vert;
