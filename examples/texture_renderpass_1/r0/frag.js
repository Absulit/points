
import { textureExternal, texture } from 'points/image';
const frag = /*wgsl*/`

${texture}
${textureExternal}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    // let imageColor = texture(image, imageSampler, uvr, false);
    let imageColor = textureExternal(image, imageSampler, uvr, false);

    return imageColor;
}
`;

export default frag;
