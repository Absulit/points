import { fnusin } from '../../src/shaders/defaultFunctions.js';

const vert = /*wgsl*/`

${fnusin}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) VertexIndex: u32
) -> Fragment {

    var modifiedPosition = position;
    modifiedPosition.w = modifiedPosition.w + sin(f32(VertexIndex) * (params.utime) * .01) * .1;

    return defaultVertexBody(modifiedPosition, color, uv);
}
`;

export default vert;
