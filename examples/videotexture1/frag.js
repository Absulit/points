import { textureExternal } from 'points/image';

const videotexture1Frag = /*wgsl*/`

${textureExternal}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let rgba = textureExternal(video, feedbackSampler, in.uvr / params.scale, true);

    return rgba;
}
`;

export default videotexture1Frag;
