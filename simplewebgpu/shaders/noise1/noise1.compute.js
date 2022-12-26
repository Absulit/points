import defaultStructs from '../defaultStructs.js';
import { valueNoise } from '../valuenoise.js';

const noise1Compute = /*wgsl*/`

${defaultStructs}

struct Variable{
    valueNoiseCreated:f32,
}

${valueNoise}


@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let utime = params.utime;

    if(variables.valueNoiseCreated != 1){

        let b = value_noise_data[0];
        valueNoise();
        variables.valueNoiseCreated = 1;
    }
}
`;

export default noise1Compute;
