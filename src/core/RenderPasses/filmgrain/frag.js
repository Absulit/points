import { texture } from '../../image.js';
import { rand } from '../../random.js';
import { snoise } from './../../noise2d.js';
const frag = /*wgsl*/`

${texture}
${rand}
${snoise}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, in.uvr, true);

    rand_seed = in.uvr + params.time;

    let noise = rand() * .5 + .5;
    return (imageColor + imageColor * noise)  * .5;
}
`;

export default frag;
