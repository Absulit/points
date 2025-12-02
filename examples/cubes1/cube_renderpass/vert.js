import { fnusin, fusin } from 'points/animation';
import { structs } from '../structs.js';

const vert = /*wgsl*/`

${structs}
${fusin}
${fnusin}

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

fn customVertexBody(position:vec4f, color:vec4f, depth:vec4f, noise:f32, uv:vec2f) -> CustomFragment {
    var result: CustomFragment;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    result.ratio = vec2(ratioX, ratioY);
    result.position = position;
    result.color = color;
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up
    result.depth = depth;
    result.noise = noise;

    return result;
}

@vertex
fn main(in: VertexIn) -> CustomFragment {
    let particle = particles[in.instanceIndex];

    let rotMatrix = rotationMatrix(particle.rotation);
    let rotated = rotMatrix * in.position.xyz;

    let scaled = rotated * particle.scale;
    let world = scaled + particle.position;

    var view = camera.camera_view;
    view[3][0] = fnusin(.5); // x
    view[3][1] = fnusin(.869); // y
    view[3][2] = fusin(1.1) - 5; // z

    let clip = camera.camera_projection * view * vec4f(world, 1.0);

    // let uvColor = vec4f(uv, 0, 1);

    let depth = vec4f(-particle.position.z / 253);

    return customVertexBody(clip, particle.color, depth, particle.noise, in.uv);
}
`;

export default vert;
