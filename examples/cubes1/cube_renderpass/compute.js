import { PI, TAU } from 'points/math';
import { structs } from '../structs.js';

const compute = /*wgsl*/`

${structs}
${PI}
${TAU}

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    // index = x + (y * numColumns) + (z * numColumns * numRows)
    let index = GlobalId.x + (GlobalId.y * THREADS_X) + (GlobalId.z * THREADS_X * THREADS_Y);

    let particle = &particles[index];

    if(particle.init == 0){

        particle.position = vec3f();
        particle.color = vec4f(1);
        particle.scale = vec3f(1);

        particle.init = 1;
    }
    // particle.rotation = vec3f(0,TAU*.1 + params.time,TAU * .10);


}
`;

export default compute;
