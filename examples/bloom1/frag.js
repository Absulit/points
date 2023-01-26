import defaultStructs from '../../src/shaders/defaultStructs.js';
import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../../src/shaders/defaultFunctions.js';
import { snoise } from '../../src/shaders/noise2d.js';
import { PI } from '../../src/shaders/defaultConstants.js';
import { texturePosition } from '../../src/shaders/image.js';
import { bloom } from '../../src/shaders/color.js';

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
${texturePosition}
${bloom}


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let startPosition = vec2(0.,0.);
    let rgbaImage = texturePosition(image, startPosition, uv / params.sliderA, true); //* .998046;

    let input = rgbaImage.r;
    let bloomVal = bloom(input, 2, params.sliderB);
    let rgbaBloom = vec4(bloomVal);


    let finalColor:vec4<f32> = rgbaImage + rgbaBloom;


    return finalColor;
}
`;

export default frag;
