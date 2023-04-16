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

    // noise = noise * intensity_value
    // noise = noise * 2 - 1
    // color = color + color * noise

    if(init == 0.){
        // rand_seed = uvr;
        init = 1.;
    }

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0,0), uvr, true);


    rand_seed = uvr + params.time;

    // let n1 = snoise(uv * 1000 * params.time);

    var noise = rand();
    noise = noise;
    noise = noise * .5 + .5;
    let finalColor = (imageColor + imageColor * noise)  * .5;

    // let finalColor:vec4<f32> = vec4(rand_seed,0, 1);

    return finalColor;
}
`;

export default frag;
