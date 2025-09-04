import { BLACK, RED } from 'points/color';
import { structs } from './structs.js';
import { PI, polar, TAU } from 'points/math';
import { rand, random } from 'points/random';

const compute = /*wgsl*/`

${structs}
${BLACK}
${RED}
${PI}
${TAU}
${polar}
${rand}
${random}

const SIZE = vec2f(800.,800.);
const speed = .01; // .0001

@compute @workgroup_size(1,1,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let index = GlobalId.x;
    let particle = &particles[index];

    if (index >= u32(params.numParticles)) {
        return;
    }

    if((*particle).init == 0){
        // rand_seed.y = .019876544 + params.time;
        rand_seed.x = f32(index) + .0001;
        rand();
        let start_position = rand_seed.xy * SIZE;
        rand();
        let angle = TAU * rand_seed.x;

        let particleColor = textureLoad(image, vec2i(start_position), 0); // image
        // var point = textureLoad(image, GlobalId.xy); // video

        (*particle).position = start_position;
        (*particle).start_position = start_position;
        (*particle).color = particleColor;
        (*particle).angle = angle;
        (*particle).life = 0;

        (*particle).init = 1;
    }

    let increment = polar(1, (*particle).angle) * speed;
    (*particle).position += increment;
    (*particle).life += 1 * speed;

    // particle

    let particle_position = (*particle).position;

    // log_data[0] = (*particle).position.x;
    // log_data[1] = (*particle).position.y;
    // log_data[2] = f32(any(particle_position >= SIZE));
    // log_data[3] = f32(any(particle_position <= vec2f()));
    // log.updated = 1;

    if((*particle).life >= (1000 * rand_seed.y) + 1000){
        rand_seed.x = f32(index) + .0001 + fract(params.time);
        rand();
        let start_position = rand_seed.xy * SIZE;
        rand();
        let angle = TAU * rand_seed.y;
        let particleColor = textureLoad(image, vec2i(start_position), 0); // image
        // particles[0] = Particle(start_position, start_position, particleColor, angle, 0);

        (*particle).position = start_position;
        (*particle).start_position = start_position;
        (*particle).color = particleColor;
        (*particle).angle = angle;
        (*particle).life = 0;
    }


    let particle_position_i = vec2i((*particle).position);
    textureStore(writeTexture, particle_position_i, (*particle).color);
    // textureStore(writeTexture, particle_position_i, RED);
}
`;

export default compute;
