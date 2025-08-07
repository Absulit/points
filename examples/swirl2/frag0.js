import { fnusin } from 'points/animation';
import { texturePosition } from 'points/image';
import { PI } from 'points/math';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${fnusin}
${snoise}
${texturePosition}
${PI}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {


    let center = vec2f(.5) * ratio;
    let uvr2 = (uvr - center); // to center

    let a = atan2(uvr2.y, uvr2.x);
    let r = length(uvr2);
    let st = vec2(a / PI, .1 / r * params.sliderA) + params.time * .1;
    let imageColor = texturePosition(image, imageSampler, vec2f(), st, false);

    return imageColor;
}
`;

export default frag;
