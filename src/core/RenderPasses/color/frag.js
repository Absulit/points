import { texture } from '../../image.js';
const frag = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, in.uvr, true);
    let finalColor = (imageColor + params.color_color) * params.color_blendAmount;

    return finalColor;
}
`;

export default frag;
