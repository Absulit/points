import { RED, brightness } from 'points/color';
import { showDebugFrame } from 'points/debug';
import { sdfCircle, sdfLine, sdfSegment } from 'points/sdf';
import { sprite } from 'points/image';
import { snoise } from 'points/noise2d';

const frag = /*wgsl*/`

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
const chars = array<u32, NUMCHARS>(15, 14, 8, 13, 19, 18);
const fontPosition = vec2(0., 0.);
const charSize = vec2(8u, 22u);
const charSizeF = vec2f(charSize);
const charAIndex = 33u; // A

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let n1 = snoise(in.uvr * 100. * 0.0016 /*params.sliderA*/ + params.time * .1);

    let numColumns = 400. * 0.2662 * n1; // params.sliderB;
    let numRows = 400. * 0.3765; // params.sliderC;
    let subuv = fract(in.uvr * vec2(numColumns, numRows));
    let subuvColor = vec4(subuv, 0, 1);

    let pixelsWidth = params.screen.x / numColumns;
    let pixelsHeight = params.screen.y / numRows;
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);
    let pixeleduv = vec2(dx * floor(in.uvr.x / dx), dy * floor(in.uvr.y / dy));
    let pixeleduvColor = vec4(pixeleduv, 0, 1);

    let charSizeF32 = charSizeF / params.screen;

    var stringColor = vec4f();
    for (var index = 0; index < NUMCHARS; index++) {
        let charIndex = chars[index];
        let charPosition = charSizeF32 * vec2f(f32(index), 0) * in.ratio;
        let space = 0.;
        stringColor += sprite(
            font,
            imageSampler,
            space + fontPosition + charPosition,
            pixeleduv / 20,
            charAIndex + charIndex,
            charSize
        );
    }
    let b = brightness(stringColor);

    let cdv = vec2(.332, 0.);
    let circlePosition = vec2(.5);
    let circleColor = sdfCircle(circlePosition, .4 * b, 0.1, subuv);
    let circleColorR = sdfCircle(circlePosition, .4 * b, 0.1, subuv + cdv);
    let circleColorB = sdfCircle(circlePosition, .4 * b, 0.1, subuv - cdv);

    let finalColor = vec4(circleColorR, circleColor, circleColorB, 1);
    return finalColor + showDebugFrame(RED, uvr);
}
`;

export default frag;
