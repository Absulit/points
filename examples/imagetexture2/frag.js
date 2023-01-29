import defaultStructs from '../../src/shaders/defaultStructs.js';
import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../../src/shaders/defaultFunctions.js';
import { snoise } from '../../src/shaders/noise2d.js';
import { texturePosition } from './../../src/shaders/image.js';

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
${texturePosition}


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * 10);

    let dims: vec2<u32> = textureDimensions(image, 0);
    var dimsRatio = f32(dims.x) / f32(dims.y);

    // let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    //let oldKingUVClamp = uv * vec2(1,1 * dimsRatio) * ratio.x;
    let startPosition = vec2(.0);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uv / params.sliderA, false); //* .998046;

    let b = brightness(rgbaImage);
    let d = distance(uv, rgbaImage.xy);

    //let finalColor:vec4<f32> = vec4(b);
    let finalColor:vec4<f32> = mix(  vec4(1,0,0,1)   , vec4(1,1,0,1) , b) * fnusin(d);
    //let finalColor:vec4<f32> = rgbaImage;


    return finalColor;
}
`;

export default frag;
