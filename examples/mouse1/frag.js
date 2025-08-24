import { RED } from 'points/color';
import { showDebugCross, showDebugFrame } from 'points/debug';
import { sdfLine, sdfSegment } from 'points/sdf';

const frag = /*wgsl*/`

${sdfSegment}
${sdfLine}
${showDebugCross}
${showDebugFrame}
${RED}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let startPosition = mouse * ratio;

    let positionCross = showDebugCross(startPosition, RED, uvr);

    let frame = showDebugFrame(RED, uvr);

    let finalColor = positionCross + frame;

    return finalColor;
}
`;

export default frag;
