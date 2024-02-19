import { texturePosition } from 'image';
import { PI, rotateVector } from 'math';
import { blur9 } from 'effects';

const frag = /*wgsl*/`

${texturePosition}
${rotateVector}
${PI}
${blur9}



@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    // second pass doesn't use the image, that's the first pass
    // _ = texturePosition(image, imageSampler, vec2(0,0), uvr, true);
    let feedbackColor = blur9(feedbackTexture, feedbackSampler, vec2(0.,0), uvr, vec2(100.,100.), rotateVector(vec2(.4,.0), 2 * PI * params.rotation));

    let finalColor = feedbackColor;

    return finalColor;
}
`;

export default frag;
