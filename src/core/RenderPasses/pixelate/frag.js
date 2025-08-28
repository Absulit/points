import { pixelateTexturePosition, texturePosition } from '../../image.js';
const frag = /*wgsl*/`

${texturePosition}
${pixelateTexturePosition}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    let pixelatedColor = pixelateTexturePosition(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.),
        params.pixelate_pixelDims.x,
        params.pixelate_pixelDims.y,
        uvr
    );

    let finalColor:vec4f = pixelatedColor;

    return finalColor;
}
`;

export default frag;
