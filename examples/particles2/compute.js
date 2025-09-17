import { BLACK, RED } from 'points/color';
import { structs } from './structs.js';
import { PI, polar, TAU } from 'points/math';
import { rand, random } from 'points/random';
import { snoise } from 'points/noise2d';

const compute = /*wgsl*/`

${structs}
${BLACK}
${RED}
${PI}
${TAU}
${polar}
${rand}
${random}
${snoise}

const SIZE = vec2f(800.,800.);
const speed = 1.1; // .0001


@compute @workgroup_size(256,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let index = GlobalId.x;


    if (index >= NUMPARTICLES) {
        return;
    }

    rand_seed.x = f32(index);
    rand();
    let particle = &particles[index];
    particle.position = rand_seed;
    particle.color = vec4f(1,0,0,1);


}
`;

export default compute;
