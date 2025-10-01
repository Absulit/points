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
    if(particle.init == 0){
        rand_seed.x = f32(index);

        rand();
        let x = index % WIDTH;
        let y = (index / WIDTH) % HEIGHT;
        let z = index / (WIDTH * HEIGHT);
        particle.position = vec3f(f32(x - HWIDTH), f32(y - HHEIGHT), -f32(z));

        // particle.position = (particle.position * flipTexture + flipTextureCoordinates);

        particle.color = vec4f(1);
        particle.scale = vec3f(.51);
        particle.rotation = vec3f(rand_seed, rand_seed.y);

        particle.init = 1;
    }
    // let n = snoise(particle.position.xy/65000 + params.time * .0000001);
    // particle.rotation += vec3f(0,n * TAU,  -(n * TAU));
    particle.rotation += vec3f(0,params.delta,params.delta);

    // particle.position += vec3f(0, sin(f32(index) + params.delta),0) * .001;


}
`;

export default compute;
