import { fnusin } from 'points/animation';
import { snoise } from 'points/noise2d';
import { sdfCircle } from 'points/sdf';
import { WHITE, RED, layer } from 'points/color';
import { audioAverage, audioAverageSegments } from 'points/audio';

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
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let audioX = audio.data[ u32(uvr.x * params.audioLength)] / 256;

    if(params.mouseClick == 1.){
        click_event.updated = 1;
    }


    var c = vec4f();
    c.r = audioX;
    c.a = 1.;

    return c;
}
`;

export default frag;
