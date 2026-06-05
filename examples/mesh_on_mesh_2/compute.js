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

    // grid size
    let total_width = WORKGROUP_X * THREADS_X;
    let total_height = WORKGROUP_Y * THREADS_Y;

    let index = i32(in.GID.x
            + (in.GID.y * total_width)
            + (in.GID.z * total_width * total_height));

    if(index > i32(NUMTRIANGLES)){
        return;
    }

    let indexF = f32(index);

    let triangle = triangles[index];
    let a = triangle.a.xyz;
    let b = triangle.b.xyz;
    let c = triangle.c.xyz;
    rand_seed.y = indexF;;
    for(var k = 0; k < PARTICLESPERTRIANGLE; k++){
        let particle = &particles[k + index * PARTICLESPERTRIANGLE];
        if(particle.init == 0){
            let r = randomPointTriangle(a, b, c);
            particle.position = r;
            particle.init = 1;
        }
    }

}
`;

export default compute;
