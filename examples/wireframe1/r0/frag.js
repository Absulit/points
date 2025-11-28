import { RED } from 'points/color';

const frag = /*wgsl*/`

${RED}


@fragment
fn main(
    in: Fragment
) -> @location(0) vec4f {

    // Distance to nearest edge
    let edgeDist = min(min(in.barycentrics.x, in.barycentrics.y), in.barycentrics.z);
    let width = fwidth(edgeDist); // approximate derivative per pixel

    // Threshold controls line thickness
    var finalColor = RED;
    if (edgeDist < width * params.val) {
        finalColor = vec4f(1,1,1,1); // wireframe line color
    }

    return finalColor;


    // return vec4f(edgeDist);

}
`;

export default frag;
