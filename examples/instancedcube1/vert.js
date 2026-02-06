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
fn main(in: VertexIn) -> FragmentIn {
    let particle = particles[in.instanceIndex];

    var pt = rotateZ(particle.position, params.time * .9854);
    pt = rotateY(pt, params.time * .94222);
    pt = rotateX(pt, params.time * .865);

    pt.z = pt.z + (400 * UNIT * .008);

    // scale local quad position
    let scaled = in.position.xyz * .03; // particle.scale;

    // Translate to world position
    let world = scaled + pt;

    // Project to clip space (assuming orthographic projection)
    // let clip = vec4f(world, 1.0);
    let clip = camera.camera_projection * camera.camera_view * vec4f(world, 1.);


    return defaultVertexBody(clip, particle.color, in.uv, in.normal);
}
`;

export default vert;
