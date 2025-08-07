import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${texturePosition}


@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {


    let dims: vec2<u32> = textureDimensions(image, 0);

    let startPosition = vec2(.0);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr / params.scale, true); //* .998046;
    let finalColor:vec4<f32> = rgbaImage;

    return finalColor;
}
`;

export default frag;
