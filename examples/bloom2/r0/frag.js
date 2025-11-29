import { BLUE, GREEN, layer, RED } from 'points/color';
import { texture } from 'points/image';
import { sdfCircle } from 'points/sdf';

const frag = /*wgsl*/`

${texture}
${sdfCircle}
${RED}
${GREEN}
${BLUE}
${layer}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    var finalColor = 4 * BLUE;
    if(in.id == mesh.cube0){
        finalColor = 5 * RED;
    }else if(in.id == mesh.cube1){
        finalColor = 3 * GREEN;
    }

    return finalColor;
}
`;

export default frag;
