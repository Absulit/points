import { fnusin } from 'points/animation';
import { structs } from '../structs.js';

const frag = /*wgsl*/`

${fnusin}
${structs}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uvr.x  * cellSize) * sin(uvr.y * cellSize);
    let b = sin(uvr.x * uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(uvr.x * uvr.y * 10.);
    let d = distance(a,b);
    let f = d * uvr.x * uvr.y;
    let finalColor:vec4f = vec4(a*d,f*c*a,f, 1.) * color * 3;

    return finalColor;
}
`;

export default frag;
