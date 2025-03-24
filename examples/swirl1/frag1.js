import { fnusin } from 'animation';
import { texturePosition } from 'image';
import { PI, rotateVector } from 'math';
import { snoise } from 'noise2d';
import { sdfCircle } from 'sdf';

const frag = /*wgsl*/`

${fnusin}
${sdfCircle}
${rotateVector}
${PI}
${snoise}
${texturePosition}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let d = 1 - distance(uvr, vec2f(.5));
    let uvrRotated = rotateVector(uvr - vec2f(.5), params.rotation * 2 * PI * d);

    // let n = snoise(params.time + uvrRotated / params.scale) * .5 + .5;

    let imageColor = texturePosition(feedbackTexture, imageSampler, vec2(-.5), uvrRotated, false);

    return imageColor;
}
`;

export default frag;
