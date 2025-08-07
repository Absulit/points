import { texturePosition } from '../../image.js';
import { rand } from '../../random.js';
import { snoise } from './../../noise2d.js';
const frag = /*wgsl*/`

${texturePosition}
${rand}
${snoise}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);

    rand_seed = uvr + params.time;

    var noise = rand();
    noise = noise * .5 + .5;
    let finalColor = (imageColor + imageColor * noise)  * .5;

    return finalColor;
}
`;

export default frag;
