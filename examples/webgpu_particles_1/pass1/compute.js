import { structs } from '../structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) coord : vec3<u32>
) {
    _ = &buf_in;
    let offset = coord.x + coord.y * params.ubo_width;
    buf_out.weights[offset] = textureLoad(tex_in, vec2<i32>(coord.xy), 0).w;
}
`;

export default compute;
