import { sdfCircle } from 'points/sdf';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${sdfCircle}
${snoise}

// this looks like a sunset

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let time = params.time;

    var circle = sdfCircle(vec2(.5,.5) * ratio, .2, .1, uvr);

    var n1 = (snoise(uvr * 5.14 + 200. * fract(time * -.01))+1.)*.5;
    //var n2 = (snoise(uvr * 15.14 + 200. * fract(time * -.01))+1.)*.5;
    let skewMask = vec2(1, 1.1);
    let mask = (1.-sdfCircle(vec2(.5,.5) * ratio, .0999, .5, uvr * skewMask ));
    let result = vec4(1.) * mask * n1 * circle + circle;

    var finalColor:vec4f = mask * vec4(1,.5,0,1) + mix(  vec4(1,0,0,result.a),  vec4(1,.5,0,1), result );

    return finalColor;
}
`;

export default frag;
