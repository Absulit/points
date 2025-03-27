import { fnusin } from 'animation';
import { texturePosition } from 'image';
import { PI } from 'math';
import { snoise } from 'noise2d';
import { structs } from './structs.js';

const frag = /*wgsl*/`

${fnusin}
${snoise}
${texturePosition}
${PI}
${structs}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
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
