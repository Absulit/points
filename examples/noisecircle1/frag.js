import { sdfCircle } from 'points/sdf';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${sdfCircle}
${snoise}

// this looks like a sunset

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let center = vec2(.5) * ratio;
    let circle = sdfCircle(center, .2, .1, uvr);

    let n1 = (snoise(uvr * 5.14 + 200. * fract(params.time * -.01)) + 1.) * .5;
    let skewMask = vec2(1, 1.1);
    let mask = 1. -sdfCircle(vec2(.5, .5) * ratio, .0999, .5, uvr * skewMask);
    let result = vec4(1.) * mask * n1 * circle + circle;

    var finalColor = mask * vec4(1, .5, 0, 1);
    finalColor += mix(vec4(1, 0, 0, result.a), vec4(1, .5, 0, 1), result);

    return finalColor;
}
`;

export default frag;
