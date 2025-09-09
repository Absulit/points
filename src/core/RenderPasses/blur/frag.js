import { blur9 } from '../../effects.js';
import { texturePosition } from '../../image.js';
import { rotateVector, PI } from '../../math.js';
const frag = /*wgsl*/`

${texturePosition}
${PI}
${rotateVector}
${blur9}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    return blur9(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(),
        uvr,
        params.blur_resolution, // resolution
        rotateVector(params.blur_direction, params.blur_radians) // direction
    );

}
`;

export default frag;
