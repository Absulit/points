import { fnusin } from '../../src/core/defaultFunctions.js';

const frag = /*wgsl*/`

${fnusin}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    _ = points[0];
    //_ = layers.layer0[0];

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    let b = sin(uv.x * uv.y * 10. * 9.1 * .25 );
    let c = fnusin(uv.x * uv.y * 10.);
    let d = distance(a,b);
    let f = d * uv.x * uv.y;
    let finalColor:vec4<f32> = vec4(a*d,f*c*a,f, 1.);

    return finalColor;
}
`;

export default frag;
