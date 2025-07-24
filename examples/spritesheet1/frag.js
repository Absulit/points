import { showDebugCross } from 'debug';
import { GREEN, layer, RED } from 'points/color';
import { decodeNumberSprite, sprite } from 'points/image';
import { sdfLine, sdfSegment, sdfSmooth, sdfSquare } from 'sdf';
import { rotateVector } from 'math';
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

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let scaleDigits = .25;
    let startPosition = vec2(.5, .5) * ratio * scaleDigits;

    let size = vec2(8u,22u);
    let sizeF32 = vec2(f32(size.x),f32(size.y));
    let cellRatio = vec2(sizeF32.x/params.screen.x,sizeF32.y/params.screen.y)*ratio;

    let displaceInX = vec2(cellRatio.x, 0);
    let start0char = 16u;

    var numberToDecode = params.mouse.x;

    let digits = RED * decodeNumberSprite(numberToDecode, start0char, image, imageSampler, startPosition, uvr * scaleDigits, ratio, size).r;
    // -----------------------------------------------
    numberToDecode = params.mouse.y;
    let startPosition2 = startPosition - vec2(0, sizeF32.x/params.screen.y)*ratio;
    let digits2 = GREEN * decodeNumberSprite(numberToDecode, start0char, image, imageSampler, startPosition2, uvr * scaleDigits, ratio, size).r;


    //let debugTop = showDebugCross(startPosition + cellRatio, YELLOW, uvr);
    let debugPosition = mouse * ratio;
    let debugBottom = showDebugCross(debugPosition, RED, uvr);

    var finalColor:vec4<f32> = layer(layer(digits, digits2), debugBottom);

    finalColor = sdfSmooth(finalColor);
    // -----------------------------------------------
    var scaleAnim = 8.;
    var positionAnim = mouse*ratio / scaleAnim;
    var indexAnim:u32 = u32(4 * fnusin(4.));
    let animColor = sprite(bobbles, imageSampler, positionAnim, uvr / scaleAnim, indexAnim, vec2<u32>(24,24));
    // -----------------------------------------------
    scaleAnim = 10.;
    positionAnim = (mouse+vec2(.1,0))*ratio / scaleAnim;
    indexAnim = u32(51 * fract(params.time * .15));
    let animPenguin = sprite(penguin, imageSampler, positionAnim, uvr / scaleAnim, indexAnim, vec2<u32>(32,32));

    let square = sdfSquare( (mouse*ratio+vec2(.3, 0.14)), .14, 0., 0., uvr) * .5;

    return finalColor + animColor + layer(vec4(square), animPenguin);
}
`;

export default frag;
