import { structs } from './structs.js';

const vert = /*wgsl*/`

${structs}

@vertex
fn main(in: VertexIn) -> FragmentIn {
    let particle = particles[in.instanceIndex];

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    let ratio = vec2(ratioX, ratioY);
    let scaled = in.position.xy / ratio * particle.scale; // .01;

    let world = scaled + particle.position / ratio;

    let clip = params.projection * vec4f(world, 0., 1.);

    return defaultVertexBody(clip, particle.color, in.uv, in.normal);
}
`;

export default vert;
