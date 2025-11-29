import { texture } from 'points/image';
import { structs } from './../structs.js';

const frag = /*wgsl*/`

${structs}
${texture}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let finalColor = texture(readTexture, imageSampler, in.uvr, true);

    return finalColor;
}
`;

export default frag;
