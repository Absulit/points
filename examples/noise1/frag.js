import { fnusin } from 'points/animation';
import { RED, YELLOW } from 'points/color';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${fnusin}
${snoise}
${RED}
${YELLOW}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let n1 = snoise(uvr * 200. * params.scale0 + 10. * fnusin(.01));
    let n2 = snoise(uvr * 200. * params.scale1 + 10. * fnusin(.02));
    let n3 = snoise(uvr * 200. * params.scale2 + 10. * fnusin(.03));
    let n4 = fract(n1 * n2 + n3);

    //let finalColor = vec4(n4, uvr.x - n4, 0, 1);
    let finalColor = mix(RED, YELLOW, n4 );

    return finalColor;
}
`;

export default frag;
