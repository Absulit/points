import { fusin, RGBAFromHSV } from './defaultFunctions.js';
import defaultStructs from './defaultStructs.js';

const reactiondiffusionFrag = /*wgsl */`

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



// @group(0) @binding(2) var feedbackSampler: sampler;
// @group(0) @binding(3) var feedbackTexture: texture_2d<f32>;
// @group(0) @binding(4) var computeTexture: texture_2d<f32>;

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: f32,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    //let texColor = textureSample(myTexture, mySampler, uv * 1.0 + .1 * fnusin(2));
    let texColor = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1));
    let texColor2 = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) + vec2(-.001,1));
    let texColor3 = textureSample(feedbackTexture, feedbackSampler, uv * vec2(1,-1) + vec2(.001,1));

    let texColorCompute = textureSample(computeTexture, feedbackSampler, uv * vec2(1,-1));

    var particle = chemicals[0];
    var particle2 = chemicals2[0];
    let sc: ptr<storage, f32, read_write> = &variables.squaresCreated;

    let d = distance(uv, vec2(.5 + .1 * fusin(2), .5  + .1 * fusin(4.123)));
    var c = 1.;
    if(d > .1){
        c = 0;
    }


    //var finalColor = (1 - texColorCompute); //* vec4<f32>(uv.x, uv.y, 0, 1);
    let a = (1 - texColorCompute);
    var finalColor = RGBAFromHSV(a.r - .732, 1, a.r);
    //var finalColor = a;

    return finalColor;
}
`;
export default reactiondiffusionFrag;