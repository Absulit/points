import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    return texture(image, imageSampler, in.uvr * params.scale, false);
}
`;

export default frag;
