import { bloom, brightness } from '../../color.js';
import { PI } from '../../math.js';
import { texturePosition } from '../../image.js';
const frag = /*wgsl*/`

${texturePosition}
${bloom}
${brightness}
${PI}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let startPosition = vec2(0.,0.);
    let rgbaImage = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, startPosition, uvr, false); //* .998046;

    let input = brightness(rgbaImage);
    let bloomVal = bloom(input, i32(params.bloom_iterations), params.bloom_amount);
    let rgbaBloom = vec4(bloomVal);

    let finalColor:vec4f = rgbaImage + rgbaBloom;

    return finalColor;
}
`;

export default frag;
