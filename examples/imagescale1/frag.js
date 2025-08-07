import { texturePosition, texture } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${texturePosition}
${layer}
${texture}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let rgbaImage1 = texture(image1, imageSampler, uvr, true);
    let rgbaImage2 = texture(image2, imageSampler, uvr, true);
    let rgbaImage3 = texture(image3, imageSampler, uvr, true);

    let finalColor = layer(rgbaImage1, layer(rgbaImage2, rgbaImage3));

    return finalColor;
}
`;

export default frag;
