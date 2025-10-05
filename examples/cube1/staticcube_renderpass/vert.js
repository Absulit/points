const vert = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4f,
    @location(1) color: vec4f,
    @location(2) uv: vec2f,
    @location(3) normal: vec3f,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {
    // var pt = rotateZ(position.xyz, params.time * .9854);
    // pt = rotateY(pt, params.time * .94222);
    // pt = rotateX(pt, params.time * .865);

    // pt.z = pt.z;


    // let world = pt;
    let world = position.xyz;
    let clip = params.projection * params.view * vec4f(world, 1.0);

    // Project to clip space (assuming orthographic projection)
    // let clip = vec4f(pt, 1.0);

    return defaultVertexBody(clip, color, uv, normal);
}
`;

export default vert;
