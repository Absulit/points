import defaultStructs from '../defaultStructs.js';
import { fnusin, fusin, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';

const oscilloscope1Frag = /*wgsl*/`

${defaultStructs}

struct Variable{
    lastPoint: vec2<f32>,
}

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let rgbaFeedbackTexture = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) / ratio); //* .998046;


    let pointPosition = vec2(.5 + .2 * fusin(10 * params.sliderA),.5 + .2 * fusin(10 * params.sliderB));
    //let finalColor:vec4<f32> =  sdfCircle(pointPosition * ratio, 0.01 * .25, 0, uv);
    let line = sdfLine(variables.lastPoint * ratio, pointPosition * ratio, 10., uv);
    let finalColor:vec4<f32> = vec4(line); 

    variables.lastPoint = pointPosition;

    return rgbaFeedbackTexture * 0.998046 + finalColor * vec4(0,1,0,1);
}
`;

export default oscilloscope1Frag;
