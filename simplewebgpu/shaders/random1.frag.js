import defaultStructs from './defaultStructs.js';
import { fnusin, fusin } from './defaultFunctions.js';

const random1Frag = /*wgsl*/`

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

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let star = stars[0];

    let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1));
    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));


    let d = distance(uv, vec2(.5 + .1 * fusin(2), .5  + .1 * fusin(4.123)));
    var c = 1.;
    if(d > .1){
        c = 0;
    }


    let finalColor:vec4<f32> = vec4(c) + texColorCompute;

    return finalColor;
}
`;

export default random1Frag;
