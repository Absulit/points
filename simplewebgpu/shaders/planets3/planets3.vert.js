import { defaultVertexBody } from '../defaultFunctions.js';
import defaultStructs from './../defaultStructs.js';

const planets3Vert = /*wgsl*/`

${defaultStructs}

struct Planet{
    radius: f32,
    speed: f32,
    angle: f32
}

struct Variable{
    pc: f32
}

${defaultVertexBody}

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

export default planets3Vert;