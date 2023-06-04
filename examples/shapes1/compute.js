const compute = /*wgsl*/`

const workgroupSize = 1;

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    let time = params.time;
    let numPoints = u32(params.numPoints);

    // list of points for the sine wave
    let fk = f32(GlobalId.x);
    let point = &points[GlobalId.x];
    (*point).x = fk / params.numPoints;
    (*point).y = sin(  ((*point).x * 32) + time) * .1;

}
`;

export default compute;
