import { BLACK, RED } from 'points/color';
import { structs } from './../structs.js';
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

fn particleInit(particles: ptr<storage, array<Particle,NUMPARTICLES>, read_write>, index:u32, wgid:vec3u) {
    let particle = &particles[index];
    rand_seed.x = f32(index) + .8945 + fract(params.time) + random() + f32(wgid.x);
    rand();
    let start_position = rand_seed.xy * SIZE;
    rand();
    let angle = TAU * rand_seed.y;

    let particleColor = textureLoad(image, vec2i(start_position), 0); // image
    // var point = textureLoad(image, GlobalId.xy); // video

    rand();
    (*particle).position = start_position;
    (*particle).start_position = start_position;
    (*particle).color = particleColor;
    (*particle).angle = angle;
    (*particle).life = 0;
    (*particle).speed = rand_seed.x;
}

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

    let particle = &particles[index];

    if((*particle).init == 0){
        particleInit(&particles, index, WorkGroupID);
        (*particle).init = 1;
    }

    let n = snoise((*particle).position / 100 + params.time * .1);
    let increment = polar((*particle).speed + .1, (*particle).angle * n) ;
    (*particle).position += increment;
    (*particle).life += (*particle).speed;


    let particle_position = (*particle).position;
    rand();
    let life_limit = rand_seed.x * 10. + 1;
    if((*particle).life >= life_limit || any(particle_position > SIZE) || any(particle_position < vec2f()) || (*particle).color.a == 0.){
        particleInit(&particles, index, WorkGroupID);
    }

    let particle_position_i = vec2i((*particle).position);
    textureStore(writeTexture, particle_position_i, (*particle).color);
    // textureStore(writeTexture, particle_position_i, RED);


    // debug
    // log_data[0] = (*particle).position.x;
    // log_data[1] = (*particle).position.y;
    // log_data[2] = f32(any(particle_position >= SIZE));
    // log_data[3] = f32(any(particle_position <= vec2f()));
    // log.updated = 1;
}
`;

export default compute;
