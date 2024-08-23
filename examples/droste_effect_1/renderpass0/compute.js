import { structs } from '../structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    if(variables.init == 0){
        var index = 0;
        colors[index] = vec3f(248, 208, 146) / 255; index++;
        colors[index] = vec3f(21, 144, 151) / 255; index++;
        colors[index] = vec3f(56, 164, 140) / 255; index++;
        colors[index] = vec3f(26, 86, 120) / 255; index++;
        colors[index] = vec3f(37, 36, 93) / 255; index++;
        colors[index] = vec3f(87, 28, 86) / 255; index++;

        variables.init = 1;
    }


}
`;

export default compute;
