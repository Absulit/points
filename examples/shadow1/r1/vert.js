import { structs } from '../structs.js';

const vert = /*wgsl*/`

${structs}

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

export default vert;
