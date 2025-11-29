import { texture } from 'points/image';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}
${texture}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let finalColor = texture(readTexture, imageSampler, uvr, true);

    return finalColor;
}
`;

export default frag;
