import defaultStructs from '../defaultStructs.js';
import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';
import { PI } from '../defaultConstants.js';

const frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${polar}
${snoise}
${PI}


const N = 2.;

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * fnusin(1));

    let dims1: vec2<u32> = textureDimensions(image1, 0);
    let dims2: vec2<u32> = textureDimensions(image2, 0);
    let dims3: vec2<u32> = textureDimensions(image3, 0);

    var imageRatio1 = f32(dims1.x) / params.screenWidth;
    var imageRatio2 = f32(dims2.x) / params.screenWidth;
    var imageRatio3 = f32(dims3.x) / params.screenWidth;

    let d = f32(dims3.x) / params.screenWidth;

    let imageUV1 = uv * vec2(1,-1) / imageRatio1;
    let imageUV2 = uv * vec2(1,-1) / imageRatio2;
    let imageUV3 = uv * vec2(1,1) / imageRatio3;


    let rgbaImage1 = textureSample(image1, feedbackSampler, imageUV1); //* .998046;
    let rgbaImage2 = textureSample(image2, feedbackSampler, imageUV2); //* .998046;
    var rgbaImage3 = textureSample(image3, feedbackSampler, imageUV3); //* .998046;

    if(uv.x > imageRatio3){
        rgbaImage3 = vec4(0);
    }
    if(uv.y > imageRatio3){
        rgbaImage3 = vec4(0);
    }


    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = rgbaImage3;


    return finalColor;
}
`;

export default frag;
