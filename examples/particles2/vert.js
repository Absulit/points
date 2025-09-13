import { structs } from './structs.js';

const vert = /*wgsl*/`

${structs}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {

    let particle = particles[instanceIndex];
    let pos = position + vec4f(particle.position,0,1);

    return defaultVertexBody(pos, color, uv);
}
`;

export default vert;
