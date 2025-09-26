import { fnusin } from 'points/animation';
import { rotateVector } from 'points/math';
import { snoise } from 'points/noise2d';
import { texturePosition } from 'points/image';
import { brightness } from 'points/color';
import { sdfCircle } from 'points/sdf';
import { RED } from 'points/color';
import { structs } from './structs.js';
const frag = /*wgsl*/`

${structs}
${fnusin}
${snoise}
${texturePosition}
${brightness}
${rotateVector}
${sdfCircle}
${RED}

const CENTER = vec2(.5);

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {
    let c = sdfCircle(CENTER, .5, .1, uvr);

    return vec4(uv * c, c, 1);
}
`;

export default frag;
