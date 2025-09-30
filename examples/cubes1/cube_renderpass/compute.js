import { PI, TAU } from 'points/math';
import { structs } from '../structs.js';
import { rand } from 'points/random';

const compute = /*wgsl*/`

${structs}
${PI}
${TAU}
${rand}

@compute @workgroup_size(THREADS_X, THREADS_Y, THREADS_Z)
fn main(
    @builtin(global_invocation_id) GID: vec3u,
    @builtin(workgroup_id) WID: vec3u,
    @builtin(local_invocation_id) LID: vec3u
) {
    // index = x + (y * numColumns) + (z * numColumns * numRows)
    // let index = GID.x * WID.x + (GID.y * THREADS_Y * WID.y) + (GID.z * THREADS_Z * THREADS_Z * WID.z);// + (GID.y * THREADS_X) + (GID.z * THREADS_X * THREADS_Y);
    let x = WID.x;
    let y = WID.y * WORKGROUP_X;
    let z = WID.z * WORKGROUP_X * WORKGROUP_Y;

    let X = x;
    let Y = y;
    let Z = z;

    let index = X + Y + Z;

    let particle = &particles[index];

    let flipTexture = vec3(1.,-1.,1);
    let flipTextureCoordinates = vec3(-.5,.5,1);
        if(f32(index)>log_data[0]){
            log_data[0] = f32(index);
            log.updated = 1;
        }
    if(particle.init == 0){
        rand_seed.x = f32(index);

        rand();
        particle.position = vec3f(f32(X), f32(Y), -f32(Z));

        particle.position = (particle.position * flipTexture + flipTextureCoordinates);

        particle.color = vec4f(1);
        particle.scale = vec3f(.51);
        // particle.rotation = vec3f(rand_seed, rand_seed.y);

        particle.init = 1;
    }
    // particle.rotation = particle.rotation + vec3f(0,TAU*.1,TAU * .1) * .01;

    // particle.position += vec3f(0, sin(params.time),0) * .01;


}
`;

export default compute;
