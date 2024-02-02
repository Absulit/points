import { fnusin } from 'animation';
const vert = /*wgsl*/`

${fnusin}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    var modifiedPosition = position;
    modifiedPosition.w = modifiedPosition.w + sin(f32(vertexIndex) * (params.time) * .01) * .1;

    return defaultVertexBody(modifiedPosition, color, uv);
}
`;

export default vert;
