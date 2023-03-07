import { RED } from '../../src/core/color.js';
import { showDebugFrame } from '../../src/core/debug.js';
import { fnusin, sdfCircle, sdfLine, sdfSegment, brightness } from '../../src/core/defaultFunctions.js';
import { sprite, texturePosition } from './../../src/core/image.js';
import { snoise } from './../../src/core/noise2d.js';

const frag = /*wgsl*/`

${fnusin}
${texturePosition}
${sdfSegment}
${sdfLine}
${sdfCircle}
${brightness}
${sprite}
${snoise}
${RED}

// debug
${showDebugFrame}

const NUMCHARS = 6;
const CHROMATICDISPLACEMENT = 0.003695;

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let n1 = snoise(uvr * 100 * 0.0016 /*params.sliderA*/ + params.time * .1);

    let numColumns = 400. * 0.2662 * n1; // params.sliderB;
    let numRows = 400. * 0.3765; // params.sliderC;
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


    let fontPosition = vec2(0.,0.);
    let charSize = vec2(8u,22u);
    let charSizeF32 = vec2(f32(charSize.x) / params.screenWidth, f32(charSize.y) / params.screenHeight);
    let charAIndex = 33u; // A

    let chars = array<u32, NUMCHARS>(15,14,8,13,19,18);
    // let fontColor = texturePosition(font, imageSampler, fontPosition, uvr, false);
    var stringColor = vec4(0.);
    for (var index = 0; index < NUMCHARS; index++) {
        let charIndex = chars[index];
        let charPosition = charSizeF32 * vec2(f32(index), 0);
        let space = .001 * vec2(f32(index), 0);
        stringColor += sprite(font, imageSampler, space + fontPosition + charPosition, pixeleduv / 20, charAIndex + charIndex, charSize);
    }
    let b = brightness(stringColor);

    let cdv = vec2(.332, 0.);
    let circlePosition = vec2(.5, .5);
    let circleColor = sdfCircle(circlePosition, .4 * b, 0.1, subuv);
    let circleColorR = sdfCircle(circlePosition, .4 * b, 0.1, subuv + cdv);
    let circleColorB = sdfCircle(circlePosition, .4 * b, 0.1, subuv - cdv);

    let finalColor:vec4<f32> = vec4(circleColorR, circleColor, circleColorB, 1);
    return finalColor + showDebugFrame(RED, uvr);
}
`;

export default frag;
