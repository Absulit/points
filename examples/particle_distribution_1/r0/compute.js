import { rand } from "points/random";
import { structs } from "../structs.js";

const compute = /*wgsl*/`

${structs}
${rand}

// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(THREADS_X,THREADS_Y,THREADS_Z)
fn main(in: ComputeIn) {

    let x = in.WID.x * THREADS_X + in.LID.x;
    let y = in.WID.y * THREADS_Y + in.LID.y;
    let z = in.WID.z * THREADS_Z + in.LID.z;

    let X = x;
    let Y = y * (WORKGROUP_X * THREADS_X);
    let Z = z * (WORKGROUP_X * THREADS_X) * (WORKGROUP_Y * THREADS_Y);

    let index = i32(X + Y + Z);
    let indexF = f32(index);

    if(index > i32(NUMTRIANGLES)){
        return;
    }

    let i = index * 3;

    let v0 = &vertex_data[i];
    let v1 = &vertex_data[i+1];
    let v2 = &vertex_data[i+2];
    let position = &rand_positions[index];

    rand_seed.y = indexF;
    rand();
    var r1 = rand_seed.x;
    var r2 = rand_seed.y;

    if (r1 + r2 > 1.) {
        r1 = 1. - r1;
        r2 = 1. - r2;
    }

    let u = r1;
    let v = r2;
    let w = 1.0 - r1 - r2;

    let point = u*v0.xyz + v*v1.xyz + w*v2.xyz;

    position.x = point.x;
    position.y = point.y;
    position.z = point.z;
}
`;

export default compute;
