import { structs } from '../structs.js';
import { rand } from 'points/random';

const compute = /*wgsl*/`

${structs}
${rand}

const HWIDTH = WIDTH / 2;
const HHEIGHT = HEIGHT / 2;

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(in: ComputeIn) {
    // index = x + (y * numColumns) + (z * numColumns * numRows)

    let x = WID.x * THREADS_X + LID.x;
    let y = WID.y * THREADS_Y + LID.y;
    let z = WID.z * THREADS_Z + LID.z;

    let X = x;
    let Y = y * (WORKGROUP_X * THREADS_X);
    let Z = z * (WORKGROUP_X * THREADS_X) * (WORKGROUP_Y * THREADS_Y);

    let index = i32(X + Y + Z);

    let particle = &particles[index];

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
        particle.scale = vec3f(.31);

        particle.init = 1;
    }
    rand_seed.y = f32(index);
    rand();
    let dir = mix(-1, 1, step(.5, rand_seed.y));
}
`;

export default compute;
