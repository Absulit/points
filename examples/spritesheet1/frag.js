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
fn main(in: FragmentIn) -> @location(0) vec4f {

    let center = vec2(.5) * in.ratio ;
    // start in center if mouse is not moving yet
    let mouser = mix(mouse * ratio, center, select(0., 1., any(mouse == vec2f())));
    let startPosition = center * scaleDigits;
    let cellRatio =
        vec2(sizeF32.x / params.screen.x, sizeF32.y / params.screen.y) * in.ratio;

    let displaceInX = vec2(cellRatio.x, 0);
    let start0char = 16u;

    var numberToDecode = params.mouse.x;

    let digits = RED * decodeNumberSprite(
        numberToDecode,
        start0char,
        image,
        imageSampler,
        startPosition,
        in.uvr * scaleDigits,
        ratio,
        size
    ).r;
    // -----------------------------------------------
    numberToDecode = params.mouse.y;
    let startPosition2 =
        startPosition - vec2(0, sizeF32.x / params.screen.y) * in.ratio;
    let digits2 = GREEN * decodeNumberSprite(
        numberToDecode,
        start0char,
        image,
        imageSampler,
        startPosition2,
        in.uvr * scaleDigits,
        ratio,
        size
    ).r;

    //let debugTop = showDebugCross(startPosition + cellRatio, YELLOW, in.uvr);
    let debugPosition = mouser;
    let debugBottom = showDebugCross(debugPosition, RED, in.uvr);

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
        in.uvr / scaleAnim,
        indexAnim,
        vec2u(24,24)
    );
    // -----------------------------------------------
    scaleAnim = 10.;
    positionAnim = (mouser + vec2(.1, 0) * in.ratio) / scaleAnim;
    indexAnim = u32(51 * fract(params.time * .15));
    let animPenguin = sprite(
        penguin,
        imageSampler,
        positionAnim,
        in.uvr / scaleAnim,
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
