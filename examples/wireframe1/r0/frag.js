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

    // Threshold controls line thickness
    var finalColor = RED;
    if (edgeDist < width * params.thickness) {
        finalColor = WHITE; // wireframe line color
    }

    return finalColor;
}
`;

export default frag;
