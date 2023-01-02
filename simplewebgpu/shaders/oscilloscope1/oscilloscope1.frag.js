import defaultStructs from '../defaultStructs.js';
import { fnusin, fusin, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';

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
${snoise}

fn f2(speed:f32, substract:f32)->f32{
    return (sin((params.utime - substract) * speed) + 1) * .5;
}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv);

    let rgbaFeedbackTexture = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) / ratio); //* .998046;


    let pointPosition = vec2(f2(10 * params.sliderA, 0.), f2(10 * params.sliderB, 0.));
    let prevPosition = vec2(f2(10 * params.sliderA, .02), f2(10 * params.sliderB, .02));
    //let finalColor:vec4<f32> =  sdfCircle(pointPosition * ratio, 0.01 * .25, 0, uv);
    let line = sdfLine(prevPosition, pointPosition, 2., uv / ratio / params.sliderC);
    let finalColor:vec4<f32> = rgbaFeedbackTexture * 0.998046 + vec4(line) * vec4(0,1,0,1);

    // this is not used, the reason? I dunno, the value is not correct, so I had to create a prevPosition instead
    variables.lastPoint = vec2(pointPosition.x, pointPosition.y);

    return finalColor;
}
`;

export default oscilloscope1Frag;
