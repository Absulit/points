import { RED, WHITE } from 'points/color';

const frag = /*wgsl*/`

${RED}
${WHITE}


@fragment
fn main(
    in: Fragment
) -> @location(0) vec4f {

    // Distance to nearest edge
    let edgeDist = min(min(in.barycentrics.x, in.barycentrics.y), in.barycentrics.z);
    let width = fwidth(edgeDist); // approximate derivative per pixel

    let wireframeColor = WHITE;
    let fillColor = RED;
    let finalColor = mix(fillColor, wireframeColor, step(edgeDist, width * params.thickness));

    return finalColor;
}
`;

export default frag;
