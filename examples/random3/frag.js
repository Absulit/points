import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let texColorCompute = texture(computeTexture, feedbackSampler, in.uvr, false);

    return texColorCompute;
}
`;

export default frag;
