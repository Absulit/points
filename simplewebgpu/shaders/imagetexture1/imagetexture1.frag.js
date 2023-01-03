import defaultStructs from '../defaultStructs.js';
import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';

const imagetexture1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${polar}
${snoise}


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * fnusin(1));

    let dims: vec2<u32> = textureDimensions(image, 0);
    var dimsRatio = f32(dims.x) / f32(dims.y);

    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.x / params.sliderA;
    //let oldKingUVClamp = uv * vec2(1,1 * dimsRatio) * ratio.x;
    let rgbaImage = textureSample(image, feedbackSampler, imageUV); //* .998046;


    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = rgbaImage;


    return finalColor;
}
`;

export default imagetexture1Frag;
