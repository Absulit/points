import { structs } from './structs.js';
import { sdfCircle } from 'points/sdf';

const frag = /*wgsl*/`

${structs}
${sdfCircle}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let c = sdfCircle(vec2f(.5), .5, .0, in.uv);

    let finalColor = vec4f(in.color.rgb * c, in.color.a * c);

    return finalColor;
}
`;

export default frag;
