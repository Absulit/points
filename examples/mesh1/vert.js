import { fnusin } from 'points/animation';
const vert = /*wgsl*/`

${fnusin}

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    var modifiedPosition = position;
    modifiedPosition.w = modifiedPosition.w + sin(f32(vertexIndex) * (params.time) * .01) * .1;

    return defaultVertexBody(modifiedPosition, color, uv, normal);
}
`;

export default vert;
