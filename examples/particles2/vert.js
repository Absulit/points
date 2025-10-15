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

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    let ratio = vec2(ratioX, ratioY);
    let scaled = position.xy * particle.scale;//.01;

    let world = scaled + particle.position / ratio;

    let clip = params.projection * vec4f(world, 0.0, 1.0);

    return defaultVertexBody(clip, particle.color, uv, normal);
}
`;

export default vert;
