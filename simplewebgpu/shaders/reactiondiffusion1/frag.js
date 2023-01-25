import { RGBAFromHSV } from '../color.js';
import { fusin } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';
import { texturePosition } from '../image.js';

const frag = /*wgsl */`

${defaultStructs}

struct Variable{
    squaresCreated: f32
}

struct Chemical{
    a: f32,
    b: f32
}

${fusin}
${RGBAFromHSV}
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
    // let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1));
    // let texColor2 = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) + vec2(-.001,1));
    // let texColor3 = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) + vec2(.001,1));

    let startPosition = vec2(0.);
    let texColorCompute = texturePosition(computeTexture, startPosition, uv / params.sliderA, false);

    _ = chemicals[0];
    _ = chemicals2[0];
    _ = variables.squaresCreated;




    //var finalColor = (1 - texColorCompute); //* vec4<f32>(uv.x, uv.y, 0, 1);
    let a = (1 - texColorCompute);
    var finalColor = RGBAFromHSV(a.r - .732, 1, a.r);
    //var finalColor = a;

    return finalColor;
}
`;
export default frag;