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
    rand_seed.x = f32(index) + .8945 + fract(params.time) + random() + f32(wgid.x);
    rand();
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-.5,.5);
    var start_position = rand_seed.xy;
    rand();
    let angle = TAU * rand_seed.y;


    var particleColor = vec4f();
    if(params.useVideo == 1){
        particleColor = textureLoad(video, vec2i(start_position * SIZE)); // video
    }else{
        particleColor = textureLoad(image, vec2i(start_position * SIZE), 0); // image
    }

    particleColor = vec4f(brightness(particleColor));

    rand();
    start_position = (start_position * flipTexture + flipTextureCoordinates) * SCREENSCALE;

    particle.position = start_position;
    particle.start_position = start_position;
    particle.color = particleColor;
    particle.angle = angle;
    particle.life = 0;
    particle.speed = rand_seed.x;
    // particle.scale = rand_seed.y * PARTICLE_SCALE * 4;
    particle.scale = 0;
    particle.life_limit = rand_seed.x * params.maxLife;
    let n = snoise(particle.position / params.turbulenceScale + params.time * .1);
    particle.noise = n;
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

    // let n = snoise(particle.position / params.turbulenceScale + params.time * .1);
    let increment = polar(particle.speed + .1, particle.angle * particle.noise) ;
    particle.position += increment / SIZE;
    particle.life += 1 + particle.speed;

    let particle_position = particle.position;
    rand();
    let life_percent = particle.life / particle.life_limit;
    particle.color = vec4f(particle.color.rgb, (1. - life_percent) * life_percent * 2);
    particle.scale = rand_seed.y * PARTICLE_SCALE * params.particleSize * life_percent;
    if(particle.life >= particle.life_limit || any(particle_position > vec2f(SCREENSCALE)) || any(particle_position < vec2f(-SCREENSCALE)) || particle.color.a == 0.){
        particleInit(&particles, index, WorkGroupID);
    }
}
`;

export default compute;
