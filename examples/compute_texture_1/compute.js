const compute = /*wgsl*/`


// ComputeIn
// @builtin(global_invocation_id) GID: vec3u,
// @builtin(workgroup_id)  in.WID: vec3u,
// @builtin(local_invocation_id) LID: vec3u
@compute @workgroup_size(8,8,1)
fn main(in: ComputeIn) {
    textureStore(writeTexture, vec2u(0,0), vec4f(1,0,0,1));
}
`;

export default compute;
