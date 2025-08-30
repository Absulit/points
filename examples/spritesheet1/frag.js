import { showDebugCross } from 'points/debug';
import { GREEN, layer, RED } from 'points/color';
import { decodeNumberSprite, sprite } from 'points/image';
import { sdfLine, sdfSegment, sdfSmooth, sdfSquare } from 'points/sdf';
import { rotateVector } from 'points/math';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}
${sdfSegment}
${sdfLine}
${showDebugCross}
${layer}
${sprite}
${sdfSmooth}
${rotateVector}
${sdfSquare}
${decodeNumberSprite}
${RED}
${GREEN}

const scaleDigits = .25;


const size = vec2(8u, 22u);
const sizeF32 = vec2f(size);

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let center = vec2(.5) * ratio ;
    let mouser = mouse * ratio;
    let startPosition = center * scaleDigits;
    let cellRatio =
        vec2(sizeF32.x / params.screen.x, sizeF32.y / params.screen.y) * ratio;

    let displaceInX = vec2(cellRatio.x, 0);
    let start0char = 16u;

    var numberToDecode = params.mouse.x;

    let digits = RED * decodeNumberSprite(
        numberToDecode,
        start0char,
        image,
        imageSampler,
        startPosition,
        uvr * scaleDigits,
        ratio,
        size
    ).r;
    // -----------------------------------------------
    numberToDecode = params.mouse.y;
    let startPosition2 =
        startPosition - vec2(0, sizeF32.x / params.screen.y) * ratio;
    let digits2 = GREEN * decodeNumberSprite(
        numberToDecode,
        start0char,
        image,
        imageSampler,
        startPosition2,
        uvr * scaleDigits,
        ratio,
        size
    ).r;

    //let debugTop = showDebugCross(startPosition + cellRatio, YELLOW, uvr);
    let debugPosition = mouser;
    let debugBottom = showDebugCross(debugPosition, RED, uvr);

    var finalColor = layer(layer(digits, digits2), debugBottom);

    finalColor = sdfSmooth(finalColor);
    // -----------------------------------------------
    var scaleAnim = 8.;
    var positionAnim = mouser / scaleAnim;
    var indexAnim = u32(4 * fnusin(4.));
    let animColor = sprite(
        bobbles,
        imageSampler,
        positionAnim,
        uvr / scaleAnim,
        indexAnim,
        vec2u(24,24)
    );
    // -----------------------------------------------
    scaleAnim = 10.;
    positionAnim = (mouser + vec2(.1, 0) * ratio) / scaleAnim;
    indexAnim = u32(51 * fract(params.time * .15));
    let animPenguin = sprite(
        penguin,
        imageSampler,
        positionAnim,
        uvr / scaleAnim,
        indexAnim,
        vec2u(32)
    );

    let square = sdfSquare(
        mouser + vec2(.3, 0.14),
        .14,
        0.,
        0.,
        uvr
    ) * .5;

    return finalColor + animColor + layer(vec4(square), animPenguin);
}
`;

export default frag;
