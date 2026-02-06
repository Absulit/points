import { texture } from 'points/image';
const frag = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let finalColor = texture(readTexture, imageSampler, in.uvr, true);

    return finalColor;
}
`;

export default frag;
