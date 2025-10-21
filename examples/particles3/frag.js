import { structs } from './structs.js';
import { sdfCircle } from 'points/sdf';

const frag = /*wgsl*/`

${structs}
${sdfCircle}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let c = sdfCircle(vec2f(.5), .5, .0, uvr);

    let finalColor = vec4f(color.rgb * c, color.a * c);

    return finalColor;
}
`;

export default frag;
