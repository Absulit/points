import { PI, TAU } from 'points/math';
import { structs } from '../structs.js';
import { rand } from 'points/random';

const compute = /*wgsl*/`

${structs}
${PI}
${TAU}
${rand}

const WIDTH = 15i;
const HEIGHT = 15i;

const HWIDTH = WIDTH / 2;
const HHEIGHT = HEIGHT / 2;

const MAXHEIGHT = 2.5;
const MAXDELAY = 5.;
const MAXSPEED = 4.;

fn angleToVector(rads:f32) -> vec2f {
    return vec2f(cos(rads), sin(rads));
}

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(
    @builtin(global_invocation_id) GID: vec3u,
    @builtin(workgroup_id) WID: vec3u,
    @builtin(local_invocation_id) LID: vec3u
) {
    // index = x + (y * numColumns) + (z * numColumns * numRows)

    let x = WID.x * THREADS_X + LID.x;
    let y = WID.y * THREADS_Y + LID.y;
    let z = WID.z * THREADS_Z + LID.z;

    let X = x;
    let Y = y * (WORKGROUP_X * THREADS_X);
    let Z = z * (WORKGROUP_X * THREADS_X) * (WORKGROUP_Y * THREADS_Y);

    let index = i32(X + Y + Z);
    let indexF = f32(index);

    let particle = &particles[index];

    if(particle.init == 0){
        rand_seed.x = indexF;
        rand();

        let angle_intensity = .005;

        particle.position = vec3f();
        particle.color = vec4f(rand_seed, rand_seed.y, 1);
        particle.scale = vec3f();
        particle.rotation = vec3f(rand_seed, rand_seed.y);
        particle.delay = params.time + rand_seed.y * MAXDELAY;
        particle.speed = 1 + rand() * MAXSPEED;

        rand();
        particle.angle = angleToVector(rand_seed.y * TAU) * angle_intensity;
        particle.init = 1;
    }

    rand_seed.y = indexF;
    rand();
    let dir = mix(-1, 1, step(.5, rand_seed.y));
    let dir2 = mix(-1, 1, step(.5, rand_seed.x));

    if(params.time >= particle.delay){

        particle.rotation += vec3f(params.delta * dir2, params.delta * dir, params.delta * dir2);

        let scaleFactor = particle.position.y / MAXHEIGHT;
        particle.factor = scaleFactor;
        particle.scale = vec3f(mix(.4, .01, 1 - scaleFactor * (1-scaleFactor) * 2));

        particle.position += vec3f(
            particle.angle.x,
            params.delta,
            particle.angle.y
        ) * particle.speed;

        if(particle.position.y > MAXHEIGHT){
            particle.init = 0;
        }
    }
}
`;

export default compute;
