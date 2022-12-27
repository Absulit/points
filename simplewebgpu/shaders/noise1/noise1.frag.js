import defaultStructs from '../defaultStructs.js';
import { fnusin } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';

const noise1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${snoise}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    let b = sin(uv.x * uv.y * 10. * 9.1 * .25 );
    let c = fnusin(uv.x * uv.y * 10.);
    let d = distance(a,b);
    let f = d * uv.x * uv.y;
    let n1 = snoise(uv * 200 * params.sliderA + 10 * fnusin(.01));
    let n2 = snoise(uv * 200 * params.sliderB + 10 * fnusin(.02));
    let n3 = snoise(uv * 200 * params.sliderC + 10 * fnusin(.03));
    //let finalColor:vec4<f32> = vec4(a*d*n2,f*c*a*n3,f * n1, 1.);
    //let finalColor = vec4(fract(n1 * n2 + n3));
    let n4 = fract(n1 * n2 + n3);
    let finalColor = vec4(n4, uv.x - n4, 0, 1);

    return finalColor;
}
`;

export default noise1Frag;
