import { sdfCircle, sdfRect } from "points/sdf";

const frag = /*wgsl*/`

${sdfRect}
${sdfCircle}

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
    let rect = sdfRect(vec2f(.01), vec2f(.99), in.uvr);
    let circle = sdfCircle(vec2f(), .1, .001, in.uvr - center);

    let rectColor = vec4(fract(in.uvr * 20), 0, 1) * rect;
    let circleColor = vec4f(circle);

    return rectColor + circleColor;
}
`;

export default frag;
