import { structs } from './structs.js';

const compute = /*wgsl*/`

${structs}


@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    let point = textureLoad(image, GlobalId.xy, 0); // image
    // var point = textureLoad(image, GlobalId.xy); // video

    textureStore(writeTexture, GlobalId.xy, point);
}
`;

export default compute;
