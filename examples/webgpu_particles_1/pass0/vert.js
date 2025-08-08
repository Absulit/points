import { structs } from '../structs.js';

const vert = /*wgsl*/`

${structs}

@vertex
fn main(in : VertexInput) -> VertexOutput {
    var quad_pos = mat2x3<f32>(params.right, params.up) * in.quad_pos;
    var position = in.position + quad_pos * 0.01;
    var out : VertexOutput;
    out.position = params.modelViewProjectionMatrix * vec4f(position, 1.0);
    out.color = in.color;
    out.quad_pos = in.quad_pos;
    return out;
}
`;

export default vert;
