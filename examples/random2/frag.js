import { fusin } from 'points/animation';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${fusin}
${texture}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let texColorCompute = texture(computeTexture, feedbackSampler, uvr, false);

    let d = distance(uvr, vec2(.5 + .1 * fusin(2.), .5  + .1 * fusin(4.123)));
    let c = step(d, .1); // if(d > .1){c = 0.;}

    let finalColor = vec4(c) + texColorCompute;

    return finalColor;
}
`;

export default frag;
