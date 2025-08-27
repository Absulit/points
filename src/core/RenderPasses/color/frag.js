import { texture } from '../../image.js';
const frag = /*wgsl*/`

${texture}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, uvr, true);
    let finalColor = (imageColor + params.color_color) * params.color_blendAmount;

    return finalColor;
}
`;

export default frag;
