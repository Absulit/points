const compute = /*wgsl*/`


// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {

    let lastColor = inputColor;

    var nextColor:vec4f;
    nextColor.r = fract(lastColor.r + 0.005);
    nextColor.g = fract(lastColor.g + 0.007);
    nextColor.b = fract(lastColor.b + 0.01);
    nextColor.a = 1.0;

    outputColor = nextColor;
}
`;

export default compute;
