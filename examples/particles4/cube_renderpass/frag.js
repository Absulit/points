import { fnusin } from 'points/animation';
import { structs } from '../structs.js';

const frag = /*wgsl*/`

${fnusin}
${structs}


@fragment
fn main(
    input: CustomFragment
) -> @location(0) vec4f {

    let depth = clamp(input.depth.r * 8, 0, 1);
    return vec4f(input.color.rgb * (1-depth), 1);
}
`;

export default frag;
