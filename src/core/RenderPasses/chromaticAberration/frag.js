import { texturePosition } from '../../image.js';
const frag = /*wgsl*/`

${texturePosition}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0,0), uvr, true);


    // --------- chromatic displacement vector
    let cdv = vec2(params.chromaticAberration_distance, 0.);
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr + cdv, true).r;
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr, true).g;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr - cdv, true).b;

    let finalColor:vec4<f32> = vec4(imageColorR, imageColorG, imageColorB, 1);

    return finalColor;
}
`;

export default frag;
