import { texturePosition } from 'points/image';
import { PI, rotateVector } from 'points/math';
import { blur9 } from 'points/effects';

const frag = /*wgsl*/`

${texturePosition}
${rotateVector}
${PI}
${blur9}



@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    // second pass doesn't use the image, that's the first pass
    // _ = texturePosition(image, imageSampler, vec2(0,0), uvr, true);
    let feedbackColor = blur9(feedbackTexture, feedbackSampler, vec2(0.,0), uvr, vec2(100.,100.), rotateVector(vec2(.4,.0), 2 * PI * params.rotation));

    let finalColor = feedbackColor;

    return finalColor;
}
`;

export default frag;
