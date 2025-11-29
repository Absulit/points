const compute = /*wgsl*/`

@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {
    let time = params.time;
}
`;

export default compute;
