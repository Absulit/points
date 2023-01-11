import { defaultVertexBody } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const random3Vert = /*wgsl*/`

${defaultStructs}
${defaultVertexBody}

struct Particle{
    x: f32,
    y: f32
}

struct Star{
    a: f32,
    b: f32,
    c: f32,
    d: f32,
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) VertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

export default random3Vert;