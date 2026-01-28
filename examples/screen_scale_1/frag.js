import { sdfCircle, sdfLine, sdfRect, sdfSegment } from "points/sdf";

const frag = /*wgsl*/`

${sdfRect}
${sdfCircle}
${sdfLine}
${sdfSegment}

const CIRCLERADIUS = .06;

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
    let circle = sdfCircle(center, .01, .001, in.uvr);
    let line = sdfLine(vec2f(.5 * in.ratio.x, in.ratio.y), vec2f(.5 * in.ratio.x, 0), 2, in.uvr);

    let circleTopRight = sdfCircle(vec2f(in.ratio), CIRCLERADIUS, .001, in.uvr);
    let circleBottomRight = sdfCircle(vec2f(1,0) * in.ratio, CIRCLERADIUS, .001, in.uvr);
    let circleBottomLeft = sdfCircle(vec2f(0,0), CIRCLERADIUS, .001, in.uvr);
    let circleTopLeft = sdfCircle(vec2f(0,1) * in.ratio, CIRCLERADIUS, .001, in.uvr);

    let rectColor = vec4(fract(in.uvr * 20), 0, 1) * rect;
    let circleColor = vec4f(circle);

    let circleTopRightColor = vec4f(circleTopRight);
    let circleBottomRightColor = vec4f(circleBottomRight);
    let circleBottomLeftColor = vec4f(circleBottomLeft);
    let circleTopLeftColor = vec4f(circleTopLeft);

    let lineColor = vec4f(line);

    return rectColor + lineColor + circleTopRightColor + circleBottomRightColor + circleBottomLeftColor + circleTopLeftColor;
}
`;

export default frag;
