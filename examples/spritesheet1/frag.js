import { fnusin, sdfLine, sdfSegment } from '../../src/core/defaultFunctions.js';
import { snoise } from '../../src/core/noise2d.js';
import { PI } from '../../src/core/defaultConstants.js';
import { decodeNumberSprite, sprite, texturePosition } from '../../src/core/image.js';
import { showDebugCross } from '../../src/core/debug.js';
import { GREEN, layer, RED, sdfSmooth } from './../../src/core/color.js';

const frag = /*wgsl*/`

${fnusin}
${sdfSegment}
${sdfLine}
${snoise}
${PI}
${texturePosition}
${showDebugCross}
${layer}
${sprite}
${sdfSmooth}
${decodeNumberSprite}
${RED}
${GREEN}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * fnusin(1) * params.sliderB);
    let startPosition = mouse * ratio * params.sliderA;
    //let rgbaImage = texturePosition(image, imageSampler, startPosition, uvr, true); //* .998046;

    // let size = vec2(64u,64u);
    let size = vec2(8u,22u);
    let sizeF32 = vec2(f32(size.x),f32(size.y));
    let cellRatio = vec2(sizeF32.x/params.screenWidth,sizeF32.y/params.screenHeight)*ratio;

    let displaceInX = vec2(cellRatio.x, 0);
    let start0char = 16u;

    var numberToDecode = params.mouseX;

    let digits = RED * decodeNumberSprite(numberToDecode, start0char, image, imageSampler, startPosition, uvr * params.sliderA, ratio, size).r;
    // -----------------------------------------------
    numberToDecode = params.mouseY;
    let startPosition2 = startPosition - vec2(0, sizeF32.x/params.screenHeight)*ratio;
    let digits2 = GREEN * decodeNumberSprite(numberToDecode, start0char, image, imageSampler, startPosition2, uvr * params.sliderA, ratio, size).r;


    //let debugTop = showDebugCross(startPosition + cellRatio, YELLOW, uvr);
    let debugBottom = showDebugCross(startPosition, RED, uvr * params.sliderA);

    var finalColor:vec4<f32> = layer(layer(digits, digits2), debugBottom);

    finalColor = sdfSmooth(finalColor);

    return finalColor;
}
`;

export default frag;
