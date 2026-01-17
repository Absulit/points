import { layer } from 'points/color';
import { texture } from 'points/image';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

${texture}
${layer}
${snoise}

@fragment
fn main(in:FragmentIn) -> @location(0) vec4f {
    let n = snoise(in.uvr * 4 + params.time) * .01;
    let dims = vec2f(textureDimensions(image, 0)) / params.screen;
    let center = vec2f(.5) * in.ratio - (dims * .5);
    let c = texture(image, imageSampler, in.uvr - center + vec2f(n), true);

    return layer(in.color, c);
}
`;

export default frag;
