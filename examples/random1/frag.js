import { fusin } from 'points/animation';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${fusin}
${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let texColorCompute = texture(computeTexture, computeTextureSampler, uvr, false);

    return texColorCompute;
}
`;

export default frag;
