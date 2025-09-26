import { structs } from './structs.js';

const compute = /*wgsl*/`

${structs}

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let width = SIDE;
    let height = SIDE;
    let index = GlobalId.x + (GlobalId.y * width) + (GlobalId.z * width * height);
    let particle = &particles[index];

    if(particle.init == 0){
        let gidCentered = vec3f(vec3i(GlobalId) - HALFSIDE);
        particle.position = vec3( gidCentered.x * UNIT,  gidCentered.y * UNIT, gidCentered.z * UNIT);
        particle.color = vec4f(1);
        particle.init = 1;
    }
}
`;

export default compute;
