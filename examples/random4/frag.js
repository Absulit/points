import { layer } from 'points/color';
import { sprite, texture } from 'points/image';
import { rand } from 'points/random';

const frag = /*wgsl*/`

${texture}
${sprite}
${layer}
${rand}

const scaleAnim = 10.;
const maxIndex = 52.;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let feedbackColor = texture(feedbackTexture, imageSampler, in.uvr, true);

    rand_seed.y = fract(params.time) + rand_seed.x;
    rand();
    let indexAnim = u32(maxIndex * rand_seed.x);
    let animPenguin = sprite(
        penguin,
        imageSampler,
        vec2f(),
        (in.uvr - params.randPosition * in.ratio) / scaleAnim,
        indexAnim,
        vec2u(32)
    );

    return layer(feedbackColor * .99, animPenguin);
}
`;

export default frag;
