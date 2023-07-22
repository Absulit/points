import { snoise } from '../../src/core/noise2d.js';
import { texturePosition } from '../../src/core/image.js';
import { bloom, brightness } from '../../src/core/color.js';
import { sdfCircle, sdfLine, sdfSegment } from '../../src/core/sdf.js';
import { fnusin, fusin } from '../../src/core/animation.js';
import { polar, PI } from '../../src/core/math.js';

const frag = /*wgsl*/`

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
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let startPosition = vec2(0.,0.);
    let rgbaImage = texturePosition(image, imageSampler, startPosition, uvr / params.sliderA, true); //* .998046;

    let input = rgbaImage.r;
    let bloomVal = bloom(input, 2, params.sliderB);
    let rgbaBloom = vec4(bloomVal);


    let finalColor:vec4<f32> = rgbaImage + rgbaBloom;


    return finalColor;
}
`;

export default frag;
