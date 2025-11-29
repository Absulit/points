import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

const SCALE = 4.;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let center = vec2f(.5) * in.ratio;

    let dims = vec2f(textureDimensions(textImg, 0));
    // if you are using uvr you have to multiply by ratio
    let imageWidth = dims / params.screen * ratio;
    let halfImageWidth = imageWidth * .5 * SCALE;

    let textColors = texture(
        textImg,
        imageSampler,
        (in.uvr / SCALE) - (center - halfImageWidth) / SCALE,
        true
    );

    return textColors;
}
`;

export default frag;
