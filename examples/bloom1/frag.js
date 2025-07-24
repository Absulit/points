import { snoise } from 'points/noise2d';
import { texturePosition } from 'points/image';
import { bloom, brightness } from 'points/color';
import { sdfCircle, sdfLine, sdfSegment } from 'sdf';
import { fnusin, fusin } from 'animation';
import { polar, PI } from 'math';

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
    let rgbaImage = texturePosition(image, imageSampler, startPosition, uvr / params.scale, true); //* .998046;

    let input = rgbaImage.r;
    let bloomVal = bloom(input, 2, params.bloom);
    let rgbaBloom = vec4(bloomVal);


    let finalColor:vec4<f32> = rgbaImage + rgbaBloom;


    return finalColor;
}
`;

export default frag;
