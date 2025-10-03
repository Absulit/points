import { structs } from './structs.js';

const vert = /*wgsl*/`

${structs}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {

    let particle = particles[instanceIndex];
    // original position modification
    // let pos = position + vec4f(particle.position,0,1);

    // scale local quad position
    let scaled = position.xy * particle.scale;//.01;

    // Translate to world position
    let world = scaled + particle.position;

    // Project to clip space (assuming orthographic projection)
    let clip = vec4f(world, 0.0, 1.0);

    return defaultVertexBody(clip, particle.color, uv);
}
`;

export default vert;
