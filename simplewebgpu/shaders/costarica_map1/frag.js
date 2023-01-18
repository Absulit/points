import defaultStructs from '../defaultStructs.js';
import { brightness, fnusin, fusin, polar, RGBAFromHSV, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';
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
${RGBAFromHSV}


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

    let dims: vec2<u32> = textureDimensions(image, 0);
    var dimsRatio = f32(dims.x) / f32(dims.y);

    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.x; // / params.sliderA;
    //let oldKingUVClamp = uv * vec2(1,1 * dimsRatio) * ratio.x;
    let rgbaImage = textureSample(image, feedbackSampler, imageUV); //* .998046;
    let b = brightness(rgbaImage);

    //let finalColor:vec4<f32> = vec4();
    //let finalColor:vec4<f32> = RGBAFromHSV(b + fract(params.utime), 1, 1) * rgbaImage * params.sliderC * 100;
    //let finalColor:vec4<f32> = RGBAFromHSV(rgbaImage.g * 2 + fract(params.utime * .1), 1, 1);
    //let finalColor:vec4<f32> = mix( RGBAFromHSV(params.sliderA, 1, 1), RGBAFromHSV(params.sliderB, 1, 1) , params.sliderC  );
    let mask = rgbaImage.g * 4096;
    let finalColor:vec4<f32> = mix( RGBAFromHSV(params.sliderA, 1, 1), RGBAFromHSV(params.sliderB, 1, 1) , rgbaImage.g  );

    let clamped = clamp(rgbaImage.g, 0, params.sliderB);


    return finalColor;
}
`;

export default frag;
