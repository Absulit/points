import { fnusin } from 'points/animation';
import { structs } from '../structs.js';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${fnusin}
${structs}
${snoise}


@fragment
fn main(
    input: CustomFragment
) -> @location(0) vec4f {

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(input.uvr.x  * cellSize) * sin(input.uvr.y * cellSize);
    let b = sin(input.uvr.x * input.uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(input.uvr.x * input.uvr.y * 10.);
    let d = distance(a,b);
    let f = d * input.uvr.x * input.uvr.y;
    let finalColor:vec4f = vec4(a*d-input.noise,f*c*a,f, 1.);

    // let n = snoise(input.uvr / .5);
    // let finalColor = vec4(n);

    let depth = clamp(input.depth.r * 8, 0, 1);
    return vec4f(finalColor.rgb * (1-depth), 1);
}
`;

export default frag;
