import { sdfRect } from "points/sdf";

const frag = /*wgsl*/`

${sdfRect}

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

    let rect = sdfRect(vec2f(.1), vec2f(.9), in.uvr);

    let finalColor:vec4f = vec4(rect);

    return finalColor;
}
`;

export default frag;
