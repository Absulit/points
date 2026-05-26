import { layer } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}
${layer}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let image = texture(fgTexture, imageSampler, in.uvr, true);
    let bgColor = vec4f(.5, 1, 0, 1);

    return layer(bgColor, image);
}
`;

export default frag;
