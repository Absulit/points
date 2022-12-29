import defaultStructs from '../defaultStructs.js';
import { fnusin } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';

const noise2Frag = /*wgsl*/`

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

    var n1 = snoise(uv * 200 * params.sliderA + 10 * fnusin(.01));
    n1 = (n1+1) * .5;

    let finalColor = vec4(n1);

    return finalColor;
}
`;

export default noise2Frag;
