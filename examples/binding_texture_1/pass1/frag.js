import { texture } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${texture}
${layer}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let renderLayer0Color = texture(renderLayer0, imageSampler, uvr, true);
    let bColor = texture(b, imageSampler, uvr, true);
    let finalColor = layer(
        bColor,
        vec4f(renderLayer0Color.rgb, renderLayer0Color.r)
    );

    return finalColor;
}
`;

export default frag;
