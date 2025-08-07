import { texturePosition } from '../../image.js';
import { fnusin } from '../../animation.js';
import { brightness, WHITE } from '../../color.js';
const frag = /*wgsl*/`

${fnusin}
${texturePosition}
${brightness}
${WHITE}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);
    let finalColor:vec4f = brightness(imageColor) * WHITE;

    return finalColor;
}
`;

export default frag;
