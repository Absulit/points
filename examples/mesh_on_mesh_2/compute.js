import { rand } from "points/random";

const compute = /*wgsl*/`

${rand}

fn randomPointTriangle(p1:vec3f, p2:vec3f, p3:vec3f) -> vec3f {
    rand();
    var r1 = rand_seed.x;
    var r2 = rand_seed.y;

    if(r1 + r2 > 1){
        r1 = 1 - r1;
        r2 = 1 - r2;
    }

    let r3 = 1 - r1 - r2;

    return (r1 * p1) + (r2 * p2) + (r3 * p3);
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
        rand_seed.y = indexF;
        let m = index / i32(NUMPARTICLES);
        let a = vertex_data[m+0].xyz;
        let b = vertex_data[m+1].xyz;
        let c = vertex_data[m+2].xyz;


        let r = randomPointTriangle(a, b, c);

        particle.position = r;
        events.log.data[0] = r.x;
        events.log.data[1] = r.y;
        events.log.data[2] = r.z;
        events.log.data[3] = indexF;
        events.log.updated = 1;

        particle.init = 1;
    }

}
`;

export default compute;
