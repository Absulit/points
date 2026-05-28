import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let image = texture(bgTexture, imageSampler, in.uvr * .628, true);

    return image;
}
`;

export default frag;
