import { fnusin } from 'animation';
import { snoise } from 'noise2d';
import { sdfCircle } from 'sdf';
import { WHITE, RED, GREEN, YELLOW, layer } from 'color';
import { audioAverage, audioAverageSegments } from 'audio';
import { texturePosition } from 'image';

const frag = /*wgsl*/`

${fnusin}
${snoise}
${sdfCircle}
${layer}
${audioAverage}
${audioAverageSegments}
${WHITE}
${RED}
${GREEN}
${YELLOW}
${texturePosition}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    if(params.mouseClick == 1.){
        click_event.updated = 1;
    }

    // let audioAverage = audioAverage(audio);
    // let audioAverageSegments = audioAverageSegments(2);

    let n = snoise(uvr / params.sliderA + params.time);
    let feedbackColor = texturePosition(feedbackTexture, imageSampler, vec2(), uvr * vec2f(1, 1.01), true);

    let segmentNum = 4;
    let subSegmentLength = i32(params.audioLength) / segmentNum;

    for (var index = 0; index < segmentNum ; index++) {
        var audioAverage = 0.;
        for (var index2 = 0; index2 < subSegmentLength; index2++) {
            let audioIndex = index2 * index;

            let audioValue = audio.data[audioIndex] / 256;
            audioAverage += audioValue;
        }
        result[index] = audioAverage / f32(subSegmentLength);
    }


    let circle1 = sdfCircle(vec2(.5), result[0] * .4, .0, uvr) * WHITE;
    let circle2 = sdfCircle(vec2(.5), result[1] * .4, .0, uvr) * GREEN;
    let circle3 = sdfCircle(vec2(.5), result[2] * .4, .0, uvr) * YELLOW;
    let circle4 = sdfCircle(vec2(.5), result[3] * .4, .0, uvr) * RED;


    // return c;
    // return layer(circle2 * WHITE, c + circle);
    // return c + circle - circle2;

    return  layer(feedbackColor * .9, layer(circle1, layer(circle2, layer(circle3, circle4))));
}
`;

export default frag;
