import { fnusin } from '../../src/core/animation.js';
import { snoise } from '../../src/core/noise2d.js';
import { sdfCircle } from '../../src/core/sdf.js';
import { WHITE, RED, layer } from '../../src/core/color.js';
import { audioAverage, audioAverageSegments } from '../../src/core/audio.js';

const frag = /*wgsl*/`

${fnusin}
${snoise}
${sdfCircle}
${layer}
${audioAverage}
${audioAverageSegments}
${WHITE}
${RED}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let audioX = audio[ u32(uvr.x * params.audioLength)] / 256;

    let audioAverage = audioAverage();
    let audioAverageSegments = audioAverageSegments(2);

    let segmentNum = 2;

    let subSegmentLength = i32(params.audioLength) / segmentNum;

    for (var index = 0; index < segmentNum ; index++) {
        var audioAverage = 0.;
        for (var index2 = 0; index2 < subSegmentLength; index2++) {
            let audioIndex = index2 * index;

            let audioValue = audio[audioIndex] / 256;
            audioAverage += audioValue;
        }
        result[index] = audioAverage / f32(subSegmentLength);
    }

    var c = vec4f(0);

    c.r = audioX;
    c.a = ceil(audioX);
    let s = snoise(uvr / c.r);
    // c.g = audio[ u32(uvr.y * 1024)] / 256;
    // c.g = 1 - (c.r * uvr.y);
    // c.a = c.r * uvr.y;

    let circle = sdfCircle(vec2(.5), audioX * .4, .0, uvr);
    
    let audioX2 = audio[0] / 256;
    let circle2 = sdfCircle(vec2(.5), audioAverage * .5, audioAverage * .5, uvr);
    
    let circle3 = sdfCircle(vec2(.5), result[0] * .4, .0, uvr);
    let circle4 = sdfCircle(vec2(.5), result[1] * .4, .0, uvr);


    // return c;
    // return layer(circle2 * WHITE, c + circle);
    // return c + circle - circle2;

    return layer(circle3 * WHITE, circle4 * RED);
}
`;

export default frag;
