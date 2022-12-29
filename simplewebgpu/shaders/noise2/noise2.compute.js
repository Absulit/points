import defaultStructs from '../defaultStructs.js';
import { valueNoise } from '../valuenoise.js';

const noise2Compute = /*wgsl*/`

${defaultStructs}


@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

}
`;

export default noise2Compute;
