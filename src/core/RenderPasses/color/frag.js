import { texturePosition } from '../../image.js';
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

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);
    let colorParam = vec4(params.color_r, params.color_g, params.color_b, params.color_a);
    let finalColor:vec4<f32> = (imageColor + colorParam) * params.color_blendAmount;

    return finalColor;
}
`;

export default frag;
