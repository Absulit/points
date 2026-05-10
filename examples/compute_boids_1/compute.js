const compute = /*wgsl*/`


// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {
    let time = params.time;
}
`;

export default compute;
