import { fnusin, rotateVector } from "../../../src/core/defaultFunctions.js";
import { texturePosition } from "../../../src/core/image.js";
import { PI } from '../../../src/core/defaultConstants.js';

const frag = /*wgsl*/`

${fnusin}
${texturePosition}
${rotateVector}
${PI}

fn blur9(image: texture_2d<f32>, imageSampler:sampler, position:vec2<f32>, uv:vec2<f32>, resolution: vec2<f32>, direction: vec2<f32>) -> vec4<f32> {
    var color = vec4(0.0);
    let off1 = vec2(1.3846153846) * direction;
    let off2 = vec2(3.2307692308) * direction;
    color += texturePosition(image, imageSampler, position, uv, true) * 0.2270270270;
    color += texturePosition(image, imageSampler, position, uv + (off1 / resolution), true) * 0.3162162162;
    color += texturePosition(image, imageSampler, position, uv - (off1 / resolution), true) * 0.3162162162;
    color += texturePosition(image, imageSampler, position, uv + (off2 / resolution), true) * 0.0702702703;
    color += texturePosition(image, imageSampler, position, uv - (off2 / resolution), true) * 0.0702702703;
    return color;
}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    // _ = texturePosition(image, imageSampler, vec2(0,0), uvr, true);
    let feedbackColor = blur9(feedbackTexture, feedbackSampler, vec2(0.,0), uvr, vec2(100.,100.), rotateVector(vec2(.4,.0), 2 * PI * params.sliderA));

    let finalColor = feedbackColor;

    return finalColor;
}
`;

export default frag;
