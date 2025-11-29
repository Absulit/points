import { fusin } from 'points/animation';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}
${fusin}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texture(image, imageSampler, uvr, true);
    // first render pass doesn't use the feedback texture, it's the second pass
    // _ = texture(feedbackTexture, feedbackSampler, uvr, true);

    let d = distance(uvr, vec2(.5 + .1 * fusin(2.), .5  + .1 * fusin(4.123)));
    let c = step(d, .1); // if(d > .1){c = 0.;}

    let finalColor = imageColor + c * vec4(1);

    return finalColor;
}
`;

export default frag;
