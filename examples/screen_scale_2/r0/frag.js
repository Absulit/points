import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}



@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    return vec4f(.24, .23, .0575, 1);
}
`;

export default frag;
