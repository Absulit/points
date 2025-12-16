import { fnusin } from 'points/animation';
import { RED } from 'points/color';
import { structs } from './../structs.js';

const frag = /*wgsl*/`

${structs}
${fnusin}
${RED}


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
fn main(in: FragmentCustom) -> @location(0) vec4f {
    return vec4f();
}
`;

export default frag;
