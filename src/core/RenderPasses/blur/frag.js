import { PI } from '../../defaultConstants.js';
import { blur9 } from '../../effects.js';
import { texturePosition } from '../../image.js';
import { rotateVector } from '../../math.js';
const frag = /*wgsl*/`

${texturePosition}
${PI}
${rotateVector}
${blur9}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {



    let feedbackColor = blur9(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.,0),
        uvr,
        vec2(100.,100.), // resolution
        rotateVector(vec2(.4,.0), 2 * PI * params.sliderA) // direction
    );

    let finalColor = feedbackColor;

    return finalColor;
}
`;

export default frag;
