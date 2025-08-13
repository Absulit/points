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

    let rgbaImage = texture(image, imageSampler, uvr * params.scale, false);
    let finalColor:vec4f = rgbaImage;

    return finalColor;
}
`;

export default frag;
