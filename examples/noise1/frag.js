import { fnusin } from 'points/animation';
import { RED, YELLOW } from 'points/color';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${fnusin}
${snoise}
${RED}
${YELLOW}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let n1 = snoise(in.uvr * 200. * params.scale0 + 10. * fnusin(.01));
    let n2 = snoise(in.uvr * 200. * params.scale1 + 10. * fnusin(.02));
    let n3 = snoise(in.uvr * 200. * params.scale2 + 10. * fnusin(.03));
    let n4 = fract(n1 * n2 + n3);

    //let finalColor = vec4(n4, in.uvr.x - n4, 0, 1);
    let finalColor = mix(RED, YELLOW, n4 );

    return finalColor;
}
`;

export default frag;
