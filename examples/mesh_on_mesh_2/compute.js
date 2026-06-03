const compute = /*wgsl*/`

override THREADS_X:u32;
override THREADS_Y:u32;
override THREADS_Z:u32;

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
    }

    let a = vertex_data[index];
    let b = vertex_data[index + 1];
    let c = vertex_data[index + 2];

    particles[index].position = vec3f();

}
`;

export default compute;
