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

    let boid = particlesB[in.instanceIndex];
    let angle = -atan2(boid.vel.x, boid.vel.y);

    // Rotate the local geometry (the plane)
    let pos = vec2f(
        (in.position.x * cos(angle)) - (in.position.y * sin(angle)),
        (in.position.x * sin(angle)) + (in.position.y * cos(angle))
    );

    var out: FragmentIn;
    out.position = vec4f(pos + boid.pos, 0.0, 1.0);
    // Color based on velocity direction
    out.color = vec4f(0.5 + boid.vel.x * 5.0, 0.5 + boid.vel.y * 5.0, 1.0, 1.0);
    return out;
}
`;

export default vert;
