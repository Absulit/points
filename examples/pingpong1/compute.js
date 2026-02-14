const compute = /*wgsl*/`


// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(64)
fn main(in: ComputeIn) {

    let i = in.GID.x;
    // Simple operation: copy + scale
    bufferOutput[i] = bufferInput[i] + .5;

    // let indexNext = (params.bufferIndex + 1) % 2;
    // buffer[indexNext] = buffer[params.bufferIndex];
    // buffer[params.bufferIndex] = buffer[indexNext] + .001;

    event_data[0] = bufferInput[i];
    // event_data[0] = buffer[params.bufferIndex];
    event.updated = 1;
}
`;

export default compute;
