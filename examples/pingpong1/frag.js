import { GREEN } from "points/color";

const frag = /*wgsl*/`

${GREEN}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    return outputColor;
}
`;

export default frag;
