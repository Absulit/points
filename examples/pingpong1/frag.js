import { GREEN } from "points/color";

const frag = /*wgsl*/`

${GREEN}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    return vec4f(bufferOutput[0]);
}
`;

export default frag;
