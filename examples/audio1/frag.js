import { fnusin } from '../../src/core/animation.js';
import { snoise } from './../../src/core/noise2d.js';
import { sdfCircle } from './../../src/core/sdf.js';
import { WHITE, RED, layer } from './../../src/core/color.js';
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
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
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
