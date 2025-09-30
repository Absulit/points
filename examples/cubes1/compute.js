import { structs } from './structs.js';
import { PI, polar, TAU } from 'points/math';
import { rand, random } from 'points/random';
import { snoise } from 'points/noise2d';
import { brightness } from 'points/color';

const compute = /*wgsl*/`

${structs}
${PI}
${TAU}
${polar}
${rand}
${random}
${snoise}
${brightness}

const SIZE = vec2f(800.,800.);
const speed = 1.1; // .0001
const SCREENSCALE = 2;
const PARTICLE_SCALE = .01;

fn particleInit(particles: ptr<storage, array<Particle,NUMPARTICLES>, read_write>, index:u32, wgid:vec3u) {
    let particle = &particles[index];
    rand_seed.x = f32(index) + .8945 + fract(params.time) / f32(wgid.x);
    rand();
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-.5,.5);
    var start_position = vec3(rand_seed.xy, 0);
    rand();
    let angle = rand_seed.x * TAU;

    let particleColor = vec4f(1);



    rand();
    // start_position = (start_position * flipTexture + flipTextureCoordinates) * SCREENSCALE;

    particle.position = start_position;
    particle.start_position = start_position;
    particle.color = particleColor;
    particle.angle = angle;
    particle.life = PARTICLE_SCALE * params.particleSize;
    particle.speed = rand_seed.x;
    // particle.scale = rand_seed.y * PARTICLE_SCALE * 4;
    particle.scale = PARTICLE_SCALE * params.particleSize;
    particle.life_limit = params.maxLife;
    // particle.noise = rand_seed.x * TAU;
}

@compute @workgroup_size(THREADS_X, THREADS_Y,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3u,
    @builtin(workgroup_id) WorkGroupID: vec3u,
    @builtin(local_invocation_id) LocalInvocationID: vec3u
) {
    let index = GlobalId.x + (GlobalId.y * THREADS_Y);

    if (index >= NUMPARTICLES) {
        return;
    }

    let particle = &particles[index];

    if(particle.init == 0){
        particleInit(&particles, index, WorkGroupID);
        particle.init = 1;
    }

    let n = snoise(particle.position.xy / params.turbulenceScale + params.time * .1);
    let increment = polar(particle.speed + .1 * n, particle.angle) ;
    particle.position += vec3(increment / SIZE, 0);
    particle.life += 1 + particle.speed;

    let particle_position = particle.position;
    rand();
    let life_percent = particle.life / particle.life_limit;
    particle.color = vec4f(particle.color.rgb, (1. - life_percent) * life_percent * 2);

    if(particle.life >= particle.life_limit || any(particle_position.xy > vec2f(SCREENSCALE)) || any(particle_position.xy < vec2f(-SCREENSCALE)) || particle.color.a == 0.){
        particleInit(&particles, index, WorkGroupID);
    }
}
`;

export default compute;
