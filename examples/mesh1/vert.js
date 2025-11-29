import { fnusin } from 'points/animation';
const vert = /*wgsl*/`

${fnusin}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    var modifiedPosition = position;
    modifiedPosition.w = modifiedPosition.w + sin(f32(vertexIndex) * (params.time) * .01) * .1;

    return defaultVertexBody(modifiedPosition, color, uv, normal);
}
`;

export default vert;
