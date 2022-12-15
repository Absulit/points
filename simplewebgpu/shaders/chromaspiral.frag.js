import defaultStructs from './defaultStructs.js';
import { fnusin, pixelateTexture } from './defaultFunctions.js';

const chromaspiralFrag = /*wgsl*/`

${defaultStructs}

${fnusin}
${pixelateTexture}

const CHROMATIC_DISPLACEMENT = 0.1;

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    _ = points[0];

    //let texColorCompute = textureSample(computeTexture, feedbackSampler, coord);
    let texColorCompute = pixelateTexture(computeTexture, feedbackSampler, 100 * params.sliderA, 100 * params.sliderA, uv);


    let texColorComputeR = textureSample(computeTexture, feedbackSampler, uv + vec2(CHROMATIC_DISPLACEMENT * params.sliderA, 0.)).r;
    let texColorComputeB = textureSample(computeTexture, feedbackSampler, uv - vec2(CHROMATIC_DISPLACEMENT * params.sliderA, 0.)).b;


    return (texColorCompute + vec4(texColorComputeR,0,0,1) + vec4(0,0,texColorComputeB,1));
    //return texColorCompute;
}
`;

export default chromaspiralFrag;
