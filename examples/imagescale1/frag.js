import { texturePosition } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${texturePosition}
${layer}


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
    let rgbaImage1 = texturePosition(image1, feedbackSampler, startPosition, uvr, true);
    let rgbaImage2 = texturePosition(image2, feedbackSampler, startPosition, uvr, true);
    let rgbaImage3 = texturePosition(image3, feedbackSampler, startPosition, uvr, true);

    var finalColor:vec4<f32> = layer(rgbaImage2, rgbaImage3);
    finalColor = layer(rgbaImage1, finalColor);

    return finalColor;
}
`;

export default frag;
