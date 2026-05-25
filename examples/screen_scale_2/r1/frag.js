import { layer } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}
${layer}


@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let ratio = params.scale.x / params.scale.y;
    let uvm = vec2f(ratio, 1) * in.uv;
    let image = texture(meshTexture, imageSampler, uvm, true);
    let bgColor = vec4f(.5, 1, 0, 1);

    return layer(bgColor, image);
}
`;

export default frag;
