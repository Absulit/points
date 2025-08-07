import { textureExternal } from 'points/image';

const videotexture1Frag = /*wgsl*/`

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

    let rgba = textureExternal(video, feedbackSampler, uvr / params.scale, true);

    return rgba;
}
`;

export default videotexture1Frag;
