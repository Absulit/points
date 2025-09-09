import { texture } from 'points/image';

const frag = /*wgsl*/`

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

    return texColorCompute;
}
`;

export default frag;
