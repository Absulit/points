import { texturePosition } from '../../image.js';
import { fnusin } from '../../animation.js';
import { YELLOW } from '../../color.js';
const frag = /*wgsl*/`

${fnusin}
${texturePosition}
${YELLOW}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(_feedbackTexture, _feedbackSampler, vec2(0,0), uvr, true);
    let finalColor:vec4<f32> = (imageColor + YELLOW) * params.blendAmount;

    return finalColor;
}
`;

export default frag;
