import { texture } from 'points/image';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}
${texture}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvRatio: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    var point = texture(computeTexture, imageSampler, uv / params.scale, true); //* .998046;

    return point;
}
`;

export default frag;
