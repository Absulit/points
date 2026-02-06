const compute = /*wgsl*/`

@compute @workgroup_size(THREADS_X,THREADS_Y,THREADS_Z)
fn main(in: ComputeIn) {
}
`;

export default compute;
