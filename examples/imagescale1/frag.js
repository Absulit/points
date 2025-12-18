import { texture } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${layer}
${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let rgbaImage1 = texture(image1, imageSampler, in.uvr, true);
    let rgbaImage2 = texture(image2, imageSampler, in.uvr, true);
    let rgbaImage3 = texture(image3, imageSampler, in.uvr, true);

    let finalColor = layer(rgbaImage1, layer(rgbaImage2, rgbaImage3));

    return finalColor;
}
`;

export default frag;
