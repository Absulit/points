import { texturePosition } from '../../image.js';
import { fnusin } from '../../animation.js';
import { brightness, WHITE } from '../../color.js';
const frag = /*wgsl*/`

${fnusin}
${texturePosition}
${brightness}
${WHITE}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);
    let finalColor:vec4f = brightness(imageColor) * WHITE;

    return finalColor;
}
`;

export default frag;
