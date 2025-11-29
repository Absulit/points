import { brightness } from 'points/color';
import { texture } from 'points/image';
const frag = /*wgsl*/`

${texture}
${brightness}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let feedbackTextureColor = texture(
        feedbackTexture,
        imageSampler,
        uvr,
        false
    );
    let b = brightness(feedbackTextureColor);

    return vec4(vec3(b), 1);
}
`;

export default frag;
