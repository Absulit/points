import { fnusin } from 'points/animation';
import { texture } from 'points/image';
const frag = /*wgsl*/`

${fnusin}
${texture}

const CHROMATIC_DISPLACEMENT = 0.003695;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let texColorCompute = texture(computeTexture, feedbackSampler, in.uvr, true).g;

    let texColorComputeR = texture(
        computeTexture,
        feedbackSampler,
        in.uvr + vec2(CHROMATIC_DISPLACEMENT, 0.),
        true
    ).r;
    let texColorComputeB = texture(
        computeTexture,
        feedbackSampler,
        in.uvr - vec2(CHROMATIC_DISPLACEMENT, 0.), true
    ).b;

    return (texColorCompute + vec4(texColorComputeR,0,0,1) + vec4(0,0,texColorComputeB,1));
}
`;

export default frag;
