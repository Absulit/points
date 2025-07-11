import { texturePosition } from 'image';

const frag = /*wgsl*/`

${texturePosition}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let center = vec2f(.5) * ratio;

    let textColors = texturePosition(textImg, imageSampler, center, uvr, true);

    return textColors;
}
`;

export default frag;
