import { structs } from './structs.js';

const vert = /*wgsl*/`

${structs}

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
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {
    let particle = particles[instanceIndex];

        var pt = rotateZ(particle.position, params.time * .9854);
        pt = rotateY(pt, params.time * .94222);
        pt = rotateX(pt, params.time * .865);

        pt.z = pt.z + (400 * UNIT * .008);

    // scale local quad position
    let scaled = position.xyz * .01; // particle.scale;

    // Translate to world position
    let world = scaled + pt;

    // Project to clip space (assuming orthographic projection)
    let clip = vec4f(world, 1.0);






    return defaultVertexBody(clip, particle.color, uv);
}
`;

export default vert;
