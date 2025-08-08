import { fnusin } from 'points/animation';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

struct Variable{
    valueNoiseCreated:f32,
}

${fnusin}
${snoise}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uvr.x  * cellSize) * sin(uvr.y * cellSize);
    let b = sin(uvr.x * uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(uvr.x * uvr.y * 10.);
    let d = distance(a,b);
    let f = d * uvr.x * uvr.y;
    let n1 = snoise(uvr * 200. * params.scale0 + 10. * fnusin(.01));
    let n2 = snoise(uvr * 200. * params.scale1 + 10. * fnusin(.02));
    let n3 = snoise(uvr * 200. * params.scale2 + 10. * fnusin(.03));
    //let finalColor:vec4f = vec4(a*d*n2,f*c*a*n3,f * n1, 1.);
    //let finalColor = vec4(fract(n1 * n2 + n3));
    let n4 = fract(n1 * n2 + n3);
    //let finalColor = vec4(n4, uvr.x - n4, 0, 1);
    let finalColor = mix( vec4(1, 0, 0, 1.)  , vec4(1, 1, 0, 1.), n4 );

    return finalColor;
}
`;

export default frag;
