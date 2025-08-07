import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

const SCALE = 4.;

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

    let dims = vec2f(textureDimensions(textImg, 0));
    let imageWidth = dims / params.screen * ratio; // if you are using uvr you have to multiply by ratio
    let halfImageWidth = imageWidth * .5 * SCALE;

    let textColors = texture(textImg, imageSampler, (uvr / SCALE) - (center - halfImageWidth) / SCALE, true);

    return textColors;
}
`;

export default frag;
