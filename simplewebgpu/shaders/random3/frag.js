import defaultStructs from '../defaultStructs.js';
import { fnusin, fusin } from '../defaultFunctions.js';
import { texturePosition } from '../image.js';

const frag = /*wgsl*/`

${defaultStructs}

struct Particle{
    x: f32,
    y: f32
}

struct Star{
    a: f32,
    b: f32,
    c: f32,
    d: f32,
}

${fnusin}
${fusin}
${texturePosition}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let startPosition = vec2(0.);
    _ = textureSample(feedbackTexture, feedbackSampler, uv);
    let texColorCompute = texturePosition(computeTexture, startPosition, uv, false);




    let finalColor:vec4<f32> = texColorCompute;

    return finalColor;
}
`;

export default frag;
