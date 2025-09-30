import { structs } from '../structs.js';

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

fn rotationMatrix(rotation: vec3f) -> mat3x3<f32> {
    let cx = cos(rotation.x);
    let sx = sin(rotation.x);
    let cy = cos(rotation.y);
    let sy = sin(rotation.y);
    let cz = cos(rotation.z);
    let sz = sin(rotation.z);

    // Combined rotation: Rz * Ry * Rx
    return mat3x3<f32>(
        vec3f(cy * cz, cy * sz, -sy),
        vec3f(sx * sy * cz - cx * sz, sx * sy * sz + cx * cz, sx * cy),
        vec3f(cx * sy * cz + sx * sz, cx * sy * sz - sx * cz, cx * cy)
    );
}

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32,
    @builtin(instance_index) instanceIndex: u32
) -> Fragment {
    // var pt = rotateZ(position.xyz, params.time * .9854);
    // pt = rotateY(pt, params.time * .94222);
    // pt = rotateX(pt, params.time * .865);

    // pt.z = pt.z;

    // let world = pt;


    let particle = particles[instanceIndex];

    let rotMatrix = rotationMatrix(particle.rotation);
    let rotated = rotMatrix * position.xyz;

    let scaled = rotated * particle.scale;
    let world = scaled + particle.position;

    let clip = params.projection * params.view * vec4f(world, 1.0);

    return defaultVertexBody(clip, particle.color, uv);

}
`;

export default vert;
