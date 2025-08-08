import { showDebugCross, showDebugFrame } from 'points/debug';
import { sdfLine, sdfSegment } from 'points/sdf';

const frag = /*wgsl*/`

${sdfSegment}
${sdfLine}
${showDebugCross}
${showDebugFrame}


@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let startPosition = mouse * ratio;//vec2(.0);

    let positionCross = showDebugCross(startPosition, vec4(1,0,0,1.), uvr);

    let frame = showDebugFrame(vec4(1,0,0,1.), uvr);

    let finalColor:vec4f = positionCross + frame;

    return finalColor;
}
`;

export default frag;
