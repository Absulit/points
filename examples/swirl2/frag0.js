import { texture } from 'points/image';
import { PI } from 'points/math';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${snoise}
${texture}
${PI}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {


    let center = vec2f(.5) * ratio;
    let uvr2 = (in.uvr - center); // to center

    let a = atan2(in.uvr2.y, uvr2.x);
    let r = length(in.uvr2);
    let st = vec2(a / PI, .1 / r * params.sliderA) + params.time * .1;
    let imageColor = texture(image, imageSampler, st, false);

    return imageColor;
}
`;

export default frag;
