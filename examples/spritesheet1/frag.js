import { fnusin, rotateVector, sdfLine, sdfSegment, sdfSquare } from '../../src/core/defaultFunctions.js';
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
${rotateVector}
${sdfSquare}
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
    let scaleDigits = .25;
    let startPosition = vec2(.5, .5) * ratio * scaleDigits;
    //let rgbaImage = texturePosition(image, imageSampler, startPosition, uvr, true); //* .998046;

    // let size = vec2(64u,64u);
    let size = vec2(8u,22u);
    let sizeF32 = vec2(f32(size.x),f32(size.y));
    let cellRatio = vec2(sizeF32.x/params.screenWidth,sizeF32.y/params.screenHeight)*ratio;

    let displaceInX = vec2(cellRatio.x, 0);
    let start0char = 16u;

    var numberToDecode = params.mouseX;

    let digits = RED * decodeNumberSprite(numberToDecode, start0char, image, imageSampler, startPosition, uvr * scaleDigits, ratio, size).r;
    // -----------------------------------------------
    numberToDecode = params.mouseY;
    let startPosition2 = startPosition - vec2(0, sizeF32.x/params.screenHeight)*ratio;
    let digits2 = GREEN * decodeNumberSprite(numberToDecode, start0char, image, imageSampler, startPosition2, uvr * scaleDigits, ratio, size).r;


    //let debugTop = showDebugCross(startPosition + cellRatio, YELLOW, uvr);
    let debugPosition = mouse * ratio;
    let debugBottom = showDebugCross(debugPosition, RED, uvr);

    var finalColor:vec4<f32> = layer(layer(digits, digits2), debugBottom);

    finalColor = sdfSmooth(finalColor);
    // -----------------------------------------------
    var scaleAnim = 8.;
    var positionAnim = mouse*ratio / scaleAnim;
    var indexAnim:u32 = u32(4 * fnusin(4));
    let animColor = sprite(bobbles, imageSampler, positionAnim, uvr / scaleAnim, indexAnim, vec2<u32>(24,24));
    // -----------------------------------------------
    scaleAnim = 10.;
    positionAnim = (mouse+vec2(.1,0))*ratio / scaleAnim;
    indexAnim = u32(51 * fract(params.time * .15));
    let animPenguin = sprite(penguin, imageSampler, (mouse+vec2(.1,0))*ratio / scaleAnim, uvr / scaleAnim, indexAnim, vec2<u32>(32,32));

    let square = sdfSquare( (mouse+vec2(.3,0.14)) * ratio, .14, 0., 0., uvr) * .5;

    return finalColor + animColor + layer(square, animPenguin);
}
`;

export default frag;
