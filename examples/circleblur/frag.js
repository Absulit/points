import { fnusin, fusin } from '../../src/shaders/defaultFunctions.js';
import { texturePosition } from '../../src/shaders/image.js';

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
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    //let texColor = textureSample(myTexture, mySampler, uv * 1.0 + .1 * fnusin(2));
    let startPosition = vec2(0.);
    let texColor = texturePosition(feedbackTexture, feedbackSampler, startPosition, uv, false);
    let texColor2 = texturePosition(feedbackTexture, feedbackSampler, startPosition, uv + vec2(-.001,1), false);
    let texColor3 = texturePosition(feedbackTexture, feedbackSampler, startPosition, uv + vec2(.001,1), false);

    let texColorCompute = texturePosition(computeTexture, feedbackSampler, startPosition, uv, false);

    let d = distance(uv, vec2(.5 + .1 * fusin(2), .5  + .1 * fusin(4.123)));
    var c = 1.;
    if(d > .1){
        c = 0;
    }

    let decayR =  texColor.r * .9 * texColor2.r;
    let decayG =  texColor.g * .9;
    let decayB =  texColor.b * .9 * texColor3.b;
    let decayA =  texColor.a * .9;
    //var finalColor:vec4<f32> = vec4(uv.x * c + decayR, uv.y * c + decayR, c + decayB, 1);
    var finalColor:vec4<f32> = vec4(uv.x * c, uv.y * c, c, 1);
    finalColor += vec4(decayR, decayG, decayB, 1);
    finalColor += texColorCompute;

    // let cellSize = 20. + 10. * fnusin(1.);
    // let a = sin(uv.x  * cellSize) * sin(uv.y * cellSize);
    // let b = sin(uv.x * uv.y * 10. * 9.1 * .25 );
    // let cc = fnusin(uv.x * uv.y * 10.);
    // let dd = distance(a,b);
    // let f = dd * uv.x * uv.y;
    // finalColor = vec4(a*dd + decayR,f*cc*a+decayG,f+decayB, a*dd + decayA);
    // finalColor += vec4(decayR, decayG, decayB, decayA) * .1;



    return finalColor;
}
`;

export default frag;