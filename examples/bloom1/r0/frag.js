import { BLUE, GREEN, layer, RED } from 'points/color';
import { texture } from 'points/image';
import { sdfCircle } from 'points/sdf';

const frag = /*wgsl*/`

${texture}
${sdfCircle}
${RED}
${GREEN}
${BLUE}
${layer}



@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let c0 = sdfCircle(vec2f(.4)*ratio, .1, 0, uvr) * 2 * RED;
    let c1 = sdfCircle(vec2f(.5)*ratio, .1, 0, uvr) * 3 * GREEN;
    let c2 = sdfCircle(vec2f(.6)*ratio, .1, 0, uvr) * 4 * BLUE;
    let rgba = texture(image, imageSampler, uvr, true);

    return 3 * GREEN;
    // return vec4(c0 + c1 + c2);
    // return layer(rgba, layer(c0, layer(c1, c2)));
}
`;

export default frag;
