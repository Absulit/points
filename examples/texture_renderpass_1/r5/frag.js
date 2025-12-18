import { bloom, brightness } from 'points/color';
import { texture } from 'points/image';
import { PI } from 'points/math';
const frag = /*wgsl*/`

${texture}
${brightness}
${bloom}
${PI}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texture(feedbackTexture, imageSampler, in.uvr, false);
    let b = brightness(imageColor);
    let bloomVal = bloom(b, i32(10.), params.sliderC);
    let rgbaBloom = vec4(bloomVal);

    let finalColor = imageColor + rgbaBloom;

    return finalColor;
}
`;

export default frag;
