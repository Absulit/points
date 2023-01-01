import defaultStructs from '../defaultStructs.js';
import { fnusin, fusin, sdfCircle } from '../defaultFunctions.js';

const oscilloscope1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}
${sdfCircle}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let rgbaFeedbackTexture = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) / ratio); //* .998046;


    let pointPosition = vec2(.5 + .1 * fusin(10 * params.sliderA),.5 + .1 * fusin(10 * params.sliderB));
    let finalColor:vec4<f32> =  sdfCircle(pointPosition * ratio, 0.01 * .25, 0, uv);

    return rgbaFeedbackTexture * 0.998046 + finalColor;
}
`;

export default oscilloscope1Frag;
