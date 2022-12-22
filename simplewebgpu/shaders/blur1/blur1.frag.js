import { fusin } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';

const blur1Frag = /*wgsl*/`

${defaultStructs}

struct Particle{
    x: f32,
    y: f32
}

${fusin}

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    //let texColor = textureSample(myTexture, mySampler, uv * 1.0 + .1 * fnusin(2));
    let texColor = textureSample(feedbackTexture, feedbackSampler, uv);
    let texColor2 = textureSample(feedbackTexture, feedbackSampler, uv + vec2(-.001,1));
    let texColor3 = textureSample(feedbackTexture, feedbackSampler, uv + vec2(.001,1));

    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    let d = distance(uv, vec2(.5 + .1 * fusin(2), .5  + .1 * fusin(4.123)));
    //let d = distance(uv, vec2(.5, .5));
    var c = 1.;
    if(d > .1){
        c = 0;
    }

    let decayR =  texColor.r * .9 * texColor2.r;
    let decayG =  texColor.g * .9;
    let decayB =  texColor.b * .9 * texColor3.b;
    let decayA =  texColor.a * .5;
    //var finalColor:vec4<f32> = vec4(uv.x * c + decayR, uv.y * c + decayR, c + decayB, 1);
    //var finalColor:vec4<f32> = vec4(uv.x * c, uv.y * c, c, 1);

    var finalColor = (vec4(c * uv.x, c * uv.y, c * -uv.x, 1) + texColorCompute) * .5;
    //finalColor = (vec4(c) + texColorCompute) * .5 ;

    return finalColor;
}
`;

export default blur1Frag;
