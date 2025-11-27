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
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @location(5) normal: vec3f,
    @interpolate(flat) @location(6) id: u32,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    var finalColor = 4 * BLUE;
    if(id == mesh.cube0){
        finalColor = 5 * RED;
    }else if(id == mesh.cube1){
        finalColor = 3 * GREEN;
    }

    return finalColor;
}
`;

export default frag;
