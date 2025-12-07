import { BLACK, BLUE, GREEN, layer, RED } from 'points/color';
import { texture } from 'points/image';
import { sdfCircle } from 'points/sdf';

const frag = /*wgsl*/`

${texture}
${sdfCircle}
${RED}
${GREEN}
${BLUE}
${BLACK}
${layer}

const THICKNESS = .8;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    var wireframeColor = 4 * BLUE;
    if(in.id == mesh.cube0){
        wireframeColor = 5 * RED;
    }else if(in.id == mesh.cube1){
        wireframeColor = 3 * GREEN;
    }

    // Distance to nearest edge
    let edgeDist = min(min(in.barycentrics.x, in.barycentrics.y), in.barycentrics.z);
    let width = fwidth(edgeDist); // approximate derivative per pixel

    let fillColor = BLACK;
    let finalColor = mix(fillColor, wireframeColor, step(edgeDist, width * THICKNESS));

    return finalColor;
}
`;

export default frag;
