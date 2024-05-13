import { cnoise } from '../../classicnoise2d.js';
import { texturePosition } from '../../image.js';
import { snoise } from '../../noise2d.js';
const frag = /*wgsl*/`

${texturePosition}
${snoise}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let scale = params.waves_scale;
    let intensity = params.waves_intensity;
    let n1 = (snoise(uv / scale + vec2(.03, .4) * params.time) * .5 + .5) * intensity;
    let n2 = (snoise(uv / scale + vec2(.3, .02) * params.time) * .5 + .5) * intensity;
    let n = n1 + n2;

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr + n2, true);
    let finalColor:vec4<f32> = imageColor;

    return finalColor;
}
`;

export default frag;
