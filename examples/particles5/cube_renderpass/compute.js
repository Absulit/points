import { PI, TAU } from 'points/math';
import { rand } from 'points/random';
import { pnoise3 } from 'points/classicnoise3d';

const compute = /*wgsl*/`

${PI}
${TAU}
${rand}
${pnoise3}

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

fn turbulence(p:vec3f) -> f32 {
    let w = 100.0;
    var t = -.5;

    for (var f:f32 = 1; f <= 10; f+=1.){
        let power = pow( 2.0, f );
        t += abs(pnoise3(vec3(power * p), vec3(10., 10., 10.)) / power);
    }

    return t;
}

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(in: ComputeIn) {
    // index = x + (y * numColumns) + (z * numColumns * numRows)

    let x = in.WID.x * THREADS_X + in.LID.x;
    let y = in.WID.y * THREADS_Y + in.LID.y;
    let z = in.WID.z * THREADS_Z + in.LID.z;

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

        particle.position = vec3f(0,-.5,0);
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

        let b = 5.0 * pnoise3(0.5 * particle.position.xyz, vec3(100.));
        let noise = turbulence(.5 * particle.position.xyz + params.time / 3.0) * -1;

        let localMaxHeight = MAXHEIGHT + noise * 10;

        let scaleFactor = particle.position.y / localMaxHeight;
        particle.factor = scaleFactor;
        particle.scale = vec3f(mix(.4, .01, 1 - scaleFactor * (1-scaleFactor) * 2)) * params.scale;


        particle.position += vec3f(
            particle.angle.x + b * .01,
            params.delta * noise,
            particle.angle.y + b * .01
        ) * particle.speed * params.speed;



        if(particle.position.y > localMaxHeight){
            particle.init = 0;
        }
    }
}
`;

export default compute;
