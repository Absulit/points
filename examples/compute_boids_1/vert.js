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

    let angle = -atan2(a_particleVel.x, a_particleVel.y);
    let pos = vec2(
        (a_pos.x * cos(angle)) - (a_pos.y * sin(angle)),
        (a_pos.x * sin(angle)) + (a_pos.y * cos(angle))
    );

    var output : FragmentIn;
    output.position = vec4(pos + a_particlePos, 0.0, 1.0);
    output.color = vec4(
        1.0 - sin(angle + 1.0) - a_particleVel.y,
        pos.x * 100.0 - a_particleVel.y + 0.1,
        a_particleVel.x + cos(angle + 0.5),
        1.0);


    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;
