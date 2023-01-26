import { defaultVertexBody } from '../../src/shaders/defaultFunctions.js';
import defaultStructs from '../../src/shaders/defaultStructs.js';
import { Point } from './utils.js';

const vert = /*wgsl*/`

${defaultStructs}
${Point}


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

export default vert;
