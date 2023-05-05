import { texturePosition } from '../../image.js';
import { rand } from '../../random.js';
import { snoise } from './../../noise2d.js';
const frag = /*wgsl*/`

${texturePosition}
${rand}
${snoise}

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

    rand_seed = uvr + params.time;

    var noise = rand();
    noise = noise * .5 + .5;
    let finalColor = (imageColor + imageColor * noise)  * .5;

    return finalColor;
}
`;

export default frag;
