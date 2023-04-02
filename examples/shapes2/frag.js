import { fnusin } from '../../src/core/defaultFunctions.js';

const frag = /*wgsl*/`

${fnusin}

const CHROMATIC_DISPLACEMENT = 0.003695;

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let texColorCompute = textureSample(computeTexture, feedbackSampler, uvr).g;

    let texColorComputeR = textureSample(computeTexture, feedbackSampler, uvr + vec2(CHROMATIC_DISPLACEMENT, 0.)).r;
    let texColorComputeB = textureSample(computeTexture, feedbackSampler, uvr - vec2(CHROMATIC_DISPLACEMENT, 0.)).b;


    return (texColorCompute + vec4(texColorComputeR,0,0,1) + vec4(0,0,texColorComputeB,1));
}
`;

export default frag;
