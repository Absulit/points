import { fnusin } from 'points/animation';
import { rotateVector } from 'points/math';
import { snoise } from 'points/noise2d';
import { texturePosition } from 'points/image';
import { brightness } from 'points/color';
import { sdfCircle } from 'points/sdf';
import { RED } from 'points/color';
import { structs } from './structs.js';
const frag = /*wgsl*/`

${structs}
${fnusin}
${snoise}
${texturePosition}
${brightness}
${rotateVector}
${sdfCircle}
${RED}

const CENTER = vec2(.5,.5);

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

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    return vec4f(sdfCircle(CENTER, .01, .0, uvr));
}
`;

export default frag;
