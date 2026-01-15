import { layer } from "points/color";
import { texture } from "points/image";

const frag = /*wgsl*/`

${texture}
${layer}

@fragment
fn main(in:FragmentIn) -> @location(0) vec4f {
    // only the color from each vertex
    let center = vec2f(.5) * in.ratio;
    let c = texture(image, imageSampler, in.uvr - in.mouse * in.ratio, true);

    return layer(in.color, c);
}
`;

export default frag;
