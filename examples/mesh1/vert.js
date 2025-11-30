import { fnusin } from 'points/animation';
const vert = /*wgsl*/`

${fnusin}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    var modifiedPosition = in.position;
    modifiedPosition.w = modifiedPosition.w + sin(f32(in.vertexIndex) * (params.time) * .01) * .1;

    return defaultVertexBody(modifiedPosition, in.color, in.uv, in.normal);
}
`;

export default vert;
