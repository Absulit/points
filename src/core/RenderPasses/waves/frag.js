import { texturePosition } from '../../image.js';
import { snoise } from '../../noise2d.js';
const frag = /*wgsl*/`

${texturePosition}
${snoise}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let scale = params.waves_scale;
    let intensity = params.waves_intensity;
    let n1 = (snoise(uv / scale + vec2(.03, .4) * params.time) * .5 + .5) * intensity;
    let n2 = (snoise(uv / scale + vec2(.3, .02) * params.time) * .5 + .5) * intensity;
    let n = n1 + n2;

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr + n2, true);
    let finalColor:vec4f = imageColor;

    return finalColor;
}
`;

export default frag;
