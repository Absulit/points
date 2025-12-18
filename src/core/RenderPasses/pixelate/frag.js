import { pixelateTexturePosition, texturePosition } from '../../image.js';
const frag = /*wgsl*/`

${texturePosition}
${pixelateTexturePosition}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {


    let pixelatedColor = pixelateTexturePosition(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.),
        params.pixelate_pixelDims.x,
        params.pixelate_pixelDims.y,
        in.uvr
    );

    let finalColor:vec4f = pixelatedColor;

    return finalColor;
}
`;

export default frag;
