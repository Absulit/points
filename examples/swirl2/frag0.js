import { texture } from 'points/image';
import { PI } from 'points/math';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${snoise}
${texture}
${PI}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    let center = vec2f(.5) * ratio;
    let uvr2 = (uvr - center); // to center

    let a = atan2(uvr2.y, uvr2.x);
    let r = length(uvr2);
    let st = vec2(a / PI, .1 / r * params.sliderA) + params.time * .1;
    let imageColor = texture(image, imageSampler, st, false);

    return imageColor;
}
`;

export default frag;
