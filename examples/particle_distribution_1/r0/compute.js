import { structs } from "../structs.js";

const compute = /*wgsl*/`

${structs}

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

    let particle = &particles[index];

}
`;

export default compute;
