import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let bg = texture(meshTexture, imageSampler, in.uvr * .75, true);

    return bg;
}
`;

export default frag;
