import defaultStructs from '../defaultStructs.js';
import { fnusin, RGBAFromHSV, sdfLine, sdfLine2, sdfSegment } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';
import { rand } from '../random.js';

const noise2Frag = /*wgsl*/`

${defaultStructs}

struct Point{
    position: vec2<f32>,
    prev: vec2<f32>,
}

${fnusin}
${snoise}
${rand}
${sdfSegment}
${sdfLine}
${sdfLine2}
${RGBAFromHSV}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let rgbaFeedbackTexture = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1)); //* .998046;
    let rgbaCompute = textureSample(computeTexture, feedbackSampler, uv);


    var n1 = snoise(uv * 200 * params.sliderA + 10 * .033 ); //fnusin(.01)
    n1 = (n1+1) * .5;


    let scale = .01;
    var c = 1.;

    //var planet = 0];
    var lastDistance = -1.;
    var lines = -1.;
    for(var i:i32 = 0; i < i32(params.numPoints); i++){
        var point = points[i];
        var d = distance(uv, point.position);


        if(lastDistance != -1.){
            lastDistance = min(lastDistance, d);
        }else{
            lastDistance = d;
        }

        let prevDistance = distance(point.prev, point.position) * params.screenWidth;
        let isPrevDistanceShort = prevDistance < 20.;
        let isPrevNotZero = (point.prev > vec2(0,0));
        if(lines != -1){
            if(isPrevNotZero.x && isPrevNotZero.y && isPrevDistanceShort){
                lines += sdfLine(point.position, point.prev, 1., uv);
            }
        }else{
            lines = 0;
        }


    }
    if(lastDistance > .01){
        c = 0.;
    }


    //rand_seed = vec2(.5484,.6544);
    rand();
    let finalColor = rgbaFeedbackTexture * .99804684 + vec4(lines) * vec4(rand_seed, 0, 1);
    //let finalColor = (rgbaFeedbackTexture + vec4(lines) * vec4(rand_seed * uv, 1-uv.y, 1))/2;
    //let finalColor = (rgbaFeedbackTexture + vec4(lines) * RGBAFromHSV( fnusin(1), 1, 1)) * .5  ;

    return finalColor;
}
`;

export default noise2Frag;
