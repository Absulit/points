const compute = /*wgsl*/`

const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(in: ComputeIn) {
    let time = params.time;
    let numPoints = u32(params.numPoints);

    // list of points for the sine wave
    let fk = f32(in.GID.x);
    let point = &points[in.GID.x];
    (*point).x = fk / params.numPoints;
    (*point).y = sin(  ((*point).x * 32) + time) * .1;

}
`;

export default compute;
