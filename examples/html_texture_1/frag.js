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
    let dims = vec2f(textureDimensions(pointsImage, 0)) / params.screen.yy;
    let center = vec2f(.5) * in.ratio - (dims * .5);
    let centerH = vec2f(center.x, 0);
    let pi = texture(pointsImage, imageSampler, in.uvr - center + vec2f(n), true);


    let wi = texture(webgpuImage, imageSampler, in.uvr - centerH + vec2f(n), true);

    return layer(in.color, layer(pi, wi));
}
`;

export default frag;
