import { texture, textureExternal } from 'points/image';

const frag = /*wgsl*/`

${textureExternal}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    return textureExternal(webcam, imageSampler, uvr / params.scale, true);
}
`;

export default frag;
