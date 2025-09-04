import { structs } from './../structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(16,16,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let index = GlobalId.xy;

    let particleColor = textureLoad(pass0Texture, index, 0); // image

    textureStore(writeTexture, index, particleColor * .98999999);
}
`;

export default compute;
