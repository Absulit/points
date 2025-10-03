import { PI, TAU } from 'points/math';
import { structs } from '../structs.js';
import { rand } from 'points/random';
import { snoise } from 'points/noise2d';

const compute = /*wgsl*/`

${structs}
${PI}
${TAU}
${rand}
${snoise}

const WIDTH = 15i;
const HEIGHT = 15i;

const HWIDTH = WIDTH / 2;
const HHEIGHT = HEIGHT / 2;

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

    let particle = &particles[index];

    let flipTexture = vec3(1.,-1.,1);
    let flipTextureCoordinates = vec3(-.5,.5,1);
    // if(f32(index)>log_data[0]){
    //     log_data[0] = f32(index);
    //     log.updated = 1;
    // }
    let MAXHEIGHT = 2.5;
    if(particle.init == 0){
        rand_seed.x = f32(index);

        rand();
        // let x = index % WIDTH;
        // let y = (index / WIDTH) % HEIGHT;
        // let z = index / (WIDTH * HEIGHT);
        let height = MAXHEIGHT * rand_seed.x * mix(1,0, f32(particle.init_height));
        particle.position = vec3f(0, height,0);
        particle.init_height = 1;

        // particle.position = (particle.position * flipTexture + flipTextureCoordinates);

        particle.color = vec4f(rand_seed, rand_seed.y, 1);
        particle.scale = vec3f(.31);
        particle.rotation = vec3f(rand_seed, rand_seed.y);

        particle.init = 1;
    }
    let n = snoise(particle.position.xy / 200 + params.time * .01);
    particle.noise = n;
    rand_seed.y = f32(index);
    rand();
    let dir = mix(-1, 1, step(.5, rand_seed.y));


    particle.rotation += vec3f(params.delta, params.delta * n * dir, params.delta * dir);

    let scaleFactor = particle.position.y / MAXHEIGHT;
    particle.scale = vec3f(mix(.5, .01, 1 - scaleFactor * (1-scaleFactor) * 2));
    particle.position += vec3f(rand_seed.x * .01 * dir, params.delta * 1 + particle.color.x * .001, rand_seed.y * .01 * dir);



    if(particle.position.y > MAXHEIGHT){
        particle.init = 0;
    }


}
`;

export default compute;
