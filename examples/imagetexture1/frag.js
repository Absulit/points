import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    return texture(image, feedbackSampler, uvr / params.scale, true);
}
`;

export default frag;
