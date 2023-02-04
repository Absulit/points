import { fnusin, fusin } from '../../src/shaders/defaultFunctions.js';
import { texturePosition } from './../../src/shaders/image.js';

const frag = /*wgsl*/`

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

    let star = stars[0];
    let rand = rands[0];

    let startPosition = vec2(0.,0.);
    let texColor = texturePosition(feedbackTexture, feedbackSampler, startPosition, uv * vec2(1,-1), false);
    let texColorCompute = texturePosition(computeTexture, feedbackSampler, startPosition, uv * vec2(1,-1), false);


    let d = distance(uv, vec2(.5 + .1 * fusin(2), .5  + .1 * fusin(4.123)));
    var c = 1.;
    if(d > .1){
        c = 0;
    }


    let finalColor:vec4<f32> = vec4(c) + texColorCompute;

    return finalColor;
}
`;

export default frag;
