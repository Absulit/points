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

    _ = points[0];
    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));
    return texColorCompute;
}
`;

export default shapes2Frag;
