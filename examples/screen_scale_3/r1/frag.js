import { layer } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}
${layer}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let center = vec2f(.5) * in.ratio;
    let dims = vec2f(textureDimensions(fgTexture)) / params.screen.yy;
    let dimsh = dims * .5;
    let image = texture(fgTexture, imageSampler, in.uvr - center + dimsh, true);

    return image;
}
`;

export default frag;
