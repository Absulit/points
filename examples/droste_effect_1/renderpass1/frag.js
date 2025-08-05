import { sdfLine2, sdfSegment } from 'points/sdf';
import { fnusin } from 'points/animation';
import { snoise } from 'points/noise2d';
import { PI, E, rotateVector } from 'points/math';
import { texturePosition } from 'points/image';
import { RGBAFromHSV, layer } from 'points/color';
import { structs } from '../structs.js';
const frag = /*wgsl*/`

${structs}
${fnusin}
${snoise}
${sdfSegment}
${sdfLine2}
${PI}
${E}
${texturePosition}
${rotateVector}
${layer}
${RGBAFromHSV}

const RADIAN = 0.0174533;

fn sdfRing(position:vec2f, radius1:f32, uv:vec2f) -> f32 {
    let d = distance(uv, position);
    let st0 = 1. - smoothstep(radius1, radius1, d);
    let st1 = smoothstep(radius1 - .004, radius1 - .004, d);
    return st0 * st1;
}

fn annulus(position:vec2f, radius1:f32, radius2:f32, uv:vec2f) -> f32 {
    let ring1 = sdfRing(position, radius1, uv);
    let ring0 = sdfRing(position, radius2, uv);
    const w = .004;
    var vertical = sdfLine2(position + vec2(0, radius1), position + vec2(0, radius2), w, uv);
    vertical += sdfLine2(position + vec2(0, -radius1), position + vec2(0, -radius2), w, uv);
    var horizontal = sdfLine2(position + vec2(radius1, 0), position + vec2(radius2, 0), w, uv);
    horizontal += sdfLine2(position + vec2(-radius1, 0), position + vec2(-radius2, 0), w, uv);
    return ring0 + ring1 + vertical + horizontal;
}

fn complexExp(z: vec2f) -> vec2f {
    return vec2(exp(z.x)*cos(z.y),exp(z.x)*sin(z.y));
}

fn complexLog(z: vec2f) -> vec2f {
    return vec2(log(length(z)), atan2(z.y, z.x));
}
fn complexMult(a:vec2f, b:vec2f) -> vec2f {
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

fn complexMag(z:vec2f) -> f32 {
    return pow(length(z), 2.0);
}
fn complexReciprocal(z:vec2f) -> vec2f {
    return vec2(z.x / complexMag(z), -z.y / complexMag(z));
}

fn complexDiv(a:vec2f, b:vec2f) -> vec2f {
    return complexMult(a, complexReciprocal(b));
}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let sliderA = .192;
    let sliderB = 1 + 40 * fnusin(1);
    let r1 = 0.3;
    let r2 = 0.7;
    let pos = vec2f(0);
    var z = (uvr * 2) - (vec2(1) * ratio);
    z = z * sliderB * 10;

    // 4. Take the tiled strips back to ordinary space.
    z = complexLog(z);
    // 3. Scale and rotate the strips
    let scale = log(r2/r1);
    // Negate the angle to twist the other way
    let angle = atan(scale/(2.0*PI));
    z = complexDiv(z, complexExp(vec2(0,angle))*cos(angle));

    // 2. Tile the strips
    z.x = z.x % log(r2/r1);
    // 1. Take the annulus to a strip
    z = complexExp(z) * r1;

    let c = RGBAFromHSV( atan2(z.y,z.x)/PI*2,1.,1.);
    let imageColor = texturePosition(feedbackTexture, imageSampler, vec2(-.5) * ratio, z / sliderA / 10 , false);

    var a = annulus(pos, r1, r2, z);

    let board = sin(z*20.0)*10.;

    return imageColor;
}
`;

export default frag;
