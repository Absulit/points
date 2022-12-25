import { defaultVertexBody } from '../defaultFunctions.js';
import defaultStructs from './../defaultStructs.js';


const slimeVert = /*wgsl*/`

${defaultStructs}
${defaultVertexBody}

struct Particle{
    x: f32,
    y: f32,
    angle: f32,
    distance: f32
}

struct Variable{
    particlesCreated: f32
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

export default slimeVert;