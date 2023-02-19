import { RED } from '../../src/core/color.js';
import { showDebugFrame } from '../../src/core/debug.js';
import { fnusin, sdfCircle, sdfLine, sdfSegment, brightness } from '../../src/core/defaultFunctions.js';
import { texturePosition } from './../../src/core/image.js';

const frag = /*wgsl*/`

${fnusin}
${texturePosition}
${sdfSegment}
${sdfLine}
${sdfCircle}
${brightness}
${RED}

// debug
${showDebugFrame}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let numColumns = 20.;
    let numRows = 400.;
    let subuv = fract(uvr * vec2(numColumns, numRows));
    let subuvColor = vec4(subuv, 0, 1);

    let pixelsWidth = params.screenWidth / numColumns;
    let pixelsHeight = params.screenHeight / numRows;
    let dx = pixelsWidth * (1. / params.screenWidth);
    let dy = pixelsHeight * (1. / params.screenHeight);
    let pixeleduv = vec2(dx*floor( uvr.x / dx), dy * floor( uvr.y / dy));
    let pixeleduvColor = vec4(pixeleduv, 0, 1);

    let imagePosition = vec2(.0,.0);
    let imageColor = texturePosition(image, imageSampler, imagePosition, pixeleduv, false);
    let b = brightness(imageColor);

    let fontPosition = vec2(.5,.5);
    let fontColor = texturePosition(font, imageSampler, fontPosition, uvr, false);

    let circlePosition = vec2(.5, .5);
    let circleColor = sdfCircle(circlePosition, .4 * b, 0.1, subuv);

    let finalColor:vec4<f32> = circleColor;
    return finalColor + showDebugFrame(RED, uvr);
}
`;

export default frag;
