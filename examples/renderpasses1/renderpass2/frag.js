import { texturePosition } from 'points/image';
import { PI, rotateVector } from 'points/math';
import { blur9 } from 'points/effects';

const frag = /*wgsl*/`

${texturePosition}
${rotateVector}
${PI}
${blur9}



@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    // second pass doesn't use the image, that's the first pass
    // _ = texturePosition(image, imageSampler, vec2(0,0), uvr, true);
    let feedbackColor = blur9(
        feedbackTexture,
        feedbackSampler,
        vec2f(),
        uvr,
        vec2(100.),
        rotateVector(vec2(.4,.0), 2 * PI * params.rotation)
    );

    let finalColor = feedbackColor;

    return finalColor;
}
`;

export default frag;
