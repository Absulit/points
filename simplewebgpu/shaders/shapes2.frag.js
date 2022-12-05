import defaultStructs from './defaultStructs.js';
import { fnusin } from './defaultFunctions.js';

const shapes2Frag = /*wgsl*/`

${defaultStructs}

${fnusin}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let point = points[0];
    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    let b = sin(uv.x * uv.y * 10. * 9.1 * .25 );
    let c = fnusin(uv.x * uv.y * 10.);
    let d = distance(a,b);
    let f = d * uv.x * uv.y;
    let finalColor:vec4<f32> = vec4(a*d,f*c*a,f, 1.);

    return texColorCompute;
}
`;

export default shapes2Frag;
