import { fnusin } from '../../src/core/animation.js';
import { snoise } from './../../src/core/noise2d.js';

const frag = /*wgsl*/`

${fnusin}
${snoise}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var c = vec4f(0);
    c.a = 1;
    
    c.r = audio[ u32(uvr.x * params.audioLength)] / 256;
    let s = snoise(uvr / c.r);
    // c.g = audio[ u32(uvr.y * 1024)] / 256;
    // c.g = 1 - (c.r * uvr.y);
    // c.a = c.r * uvr.y;




    return c;
}
`;

export default frag;
