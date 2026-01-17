import { layer } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}
${layer}

@fragment
fn main(in:FragmentIn) -> @location(0) vec4f {
    let dims = vec2f(textureDimensions(image, 0)) / params.screen;
    let center = vec2f(.5) * in.ratio - (dims * .5);
    let c = texture(image, imageSampler, in.uvr - center, true);

    return layer(in.color, c);
}
`;

export default frag;
