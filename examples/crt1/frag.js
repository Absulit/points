import { textureExternal } from 'points/image';

const frag = /*wgsl*/`

${textureExternal}


/**
 * VertexIn
 * position: vec4f,
 * color: vec4f,
 * uv: vec2f,
 * ratio: vec2f,  // relation between params.screen.x and params.screen.y
 * uvr: vec2f,    // uv with aspect ratio corrected
 * mouse: vec2f,
 * normal: vec3f,
 * id: u32,       // mesh or instance id
 * barycentrics: vec3f,
 */
@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {
    let center = vec2f(.5) * in.ratio;
    let videoColor = textureExternal(video, imageSampler, (in.uvr - center) / .8  + center, true);

    return videoColor;
}
`;

export default frag;
