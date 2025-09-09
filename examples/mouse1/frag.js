import { RED } from 'points/color';
import { showDebugCross, showDebugFrame } from 'points/debug';
import { texture } from 'points/image';
import { sdfLine, sdfSegment } from 'points/sdf';

const frag = /*wgsl*/`

${sdfSegment}
${sdfLine}
${showDebugCross}
${showDebugFrame}
${RED}
${texture}

const SCALE = 2.;

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

    // click to play message
    let center = vec2f(.5) * ratio;
    let showMessage = select(0.,1, any(mouse * ratio <= vec2f()));

    let dims = vec2f(textureDimensions(cta, 0));
    // if you are using uvr you have to multiply by ratio
    let imageWidth = dims / params.screen * ratio;
    let halfImageWidth = imageWidth * .5 * SCALE;

    let ctaColor = texture(
        cta,
        imageSampler,
        (uvr / SCALE) - (center - halfImageWidth) / SCALE,
        true
    );

    return finalColor + ctaColor * showMessage;
}
`;

export default frag;
