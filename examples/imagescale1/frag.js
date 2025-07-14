import { texturePosition } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${texturePosition}
${layer}
${texture}


@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    // let startPosition = vec2(0.,0.);
    // let rgbaImage1 = texturePosition(image1, imageSampler, startPosition, uvr, false);
    // let rgbaImage2 = texturePosition(image2, imageSampler, startPosition, uvr, true);
    // let rgbaImage3 = texturePosition(image3, imageSampler, startPosition, uvr - vec2f(.1), true);

    let rgbaImage1 = texture(image1, imageSampler, uvr, true);
    let rgbaImage2 = texture(image2, imageSampler, uvr, true);
    let rgbaImage3 = texture(image3, imageSampler, uvr, true);

    let finalColor = layer(rgbaImage1, layer(rgbaImage2, rgbaImage3));

    return finalColor;
}
`;

export default frag;
