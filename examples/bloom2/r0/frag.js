import { BLACK, BLUE, GREEN, layer, RED } from 'points/color';
import { wireframe } from 'points/effects';

const frag = /*wgsl*/`

${RED}
${GREEN}
${BLUE}
${BLACK}
${wireframe}

const THICKNESS = .8;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    var wireframeColor = 4 * BLUE;
    if(in.id == mesh.cube0){
        wireframeColor = 5 * RED;
    }else if(in.id == mesh.cube1){
        wireframeColor = 3 * GREEN;
    }


    let fillColor = BLACK;

    return wireframe(wireframeColor, fillColor, THICKNESS, in.barycentrics);
}
`;

export default frag;
