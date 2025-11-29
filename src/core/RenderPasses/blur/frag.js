import { blur9 } from '../../effects.js';
import { texturePosition } from '../../image.js';
import { rotateVector, PI } from '../../math.js';
const frag = /*wgsl*/`

${texturePosition}
${PI}
${rotateVector}
${blur9}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

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
