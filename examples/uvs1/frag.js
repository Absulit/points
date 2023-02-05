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


    let finalColor:vec4<f32> = vec4( fract(uv * 10), 0,1);

    return finalColor;
}
`;

export default frag;
