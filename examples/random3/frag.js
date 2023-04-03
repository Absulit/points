import { fnusin, fusin } from '../../src/core/defaultFunctions.js';
import { texturePosition } from '../../src/core/image.js';

const frag = /*wgsl*/`

${fnusin}
${fusin}
${texturePosition}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let startPosition = vec2(0.);
    let texColorCompute = texturePosition(computeTexture, feedbackSampler, startPosition, uvr, false);
    let finalColor:vec4<f32> = texColorCompute;

    return finalColor;
}
`;

export default frag;
