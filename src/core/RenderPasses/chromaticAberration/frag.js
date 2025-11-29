import { texturePosition } from '../../image.js';
const frag = /*wgsl*/`

${texturePosition}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);


    // --------- chromatic displacement vector
    let cdv = vec2(params.chromaticAberration_distance, 0.);
    let d = distance(vec2(.5,.5), uvr);
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr + cdv * d, true).r;
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr, true).g;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr - cdv * d, true).b;

    let finalColor:vec4f = vec4(imageColorR, imageColorG, imageColorB, 1);

    return finalColor;
}
`;

export default frag;
