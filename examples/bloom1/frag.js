import { texture } from 'points/image';
import { bloom } from 'points/color';
import { PI } from 'points/math';

const frag = /*wgsl*/`

${texture}
${bloom}
${PI}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let rgbaImage = texture(image, imageSampler, uvr / params.scale, false);

    let input = rgbaImage.r;
    let bloomVal = bloom(input, 2, params.bloom);
    let rgbaBloom = vec4(bloomVal);


    let finalColor = rgbaImage + rgbaBloom;

    return finalColor;
}
`;

export default frag;
