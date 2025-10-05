const vert = /*wgsl*/`


fn rotateX(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let znew = p.z * c - p.y * s;
    let ynew = p.z * s + p.y * c;
    return vec3(p.x, ynew, znew);
}

fn rotateY(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.z * s;
    let znew = p.x * s + p.z * c;
    return vec3(xnew, p.y, znew);
}

fn rotateZ(p:vec3<f32>, rads:f32 ) -> vec3<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec3(xnew, ynew, p.z);
}

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
