import { texture } from 'points/image';
import { rand } from 'points/random';
const frag = /*wgsl*/`

${texture}
${rand}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let feedbackTextureColor = texture(
        feedbackTexture,
        imageSampler,
        in.uvr,
        false
    );

    rand_seed = uvr + params.time;

    let noise = rand() * .5 + .5;
    let finalColor = (feedbackTextureColor + feedbackTextureColor * noise) * .5;

    return finalColor;
}
`;

export default frag;
