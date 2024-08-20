import { fnusin, fusin } from 'animation';
import { texturePosition } from 'image';

const frag = /*wgsl*/`

struct Particle{
    x: f32,
    y: f32
}

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
    let texColor = texturePosition(feedbackTexture, feedbackSampler, startPosition, uvr, false);
    let texColor2 = texturePosition(feedbackTexture, feedbackSampler, startPosition, uvr + vec2(-.001,1), false);
    let texColor3 = texturePosition(feedbackTexture, feedbackSampler, startPosition, uvr + vec2(.001,1), false);

    let texColorCompute = texturePosition(computeTexture, feedbackSampler, startPosition, uv, false);

    let d = distance(uvr, vec2(.5 + .1 * fusin(2.), .5  + .1 * fusin(4.123)) * ratio);
    var c = 1.;
    if(d > .1){
        c = 0.;
    }

    let decayR =  texColor.r * .9 * texColor2.r;
    let decayG =  texColor.g * .9;
    let decayB =  texColor.b * .9 * texColor3.b;
    let decayA =  texColor.a * .9;

    var finalColor:vec4<f32> = vec4(uv.x * c, uv.y * c, c, 1);
    finalColor += vec4(decayR, decayG, decayB, 1);
    finalColor += texColorCompute;

    return finalColor;
}
`;

export default frag;