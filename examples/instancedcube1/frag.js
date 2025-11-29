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
fn main(in: FragmentIn) -> @location(0) vec4f {
    let c = sdfCircle(CENTER, .4, .1, in.in.uvr);

    return vec4(in.uv * c, c, c);
}
`;

export default frag;
