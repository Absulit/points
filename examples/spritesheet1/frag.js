import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../../src/core/defaultFunctions.js';
import { snoise } from '../../src/core/noise2d.js';
import { PI } from '../../src/core/defaultConstants.js';
import { sprite, texturePosition } from '../../src/core/image.js';
import { showDebugCross } from '../../src/core/debug.js';
import { layer } from './../../src/core/color.js';

const frag = /*wgsl*/`

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${polar}
${snoise}
${PI}
${texturePosition}
${showDebugCross}
${layer}
${sprite}

const RED = vec4(1.,0.,0.,1.);
const GREEN = vec4(0.,1.,0.,1.);
const BLUE = vec4(0.,0.,1.,1.);

const YELLOW = vec4(1.,1.,0.,1.);
const CYAN = vec4(0.,1.,1.,1.);
const MAGENTA = vec4(1.,0.,1.,1.);

const WHITE = vec4(1.,1.,1.,1.);
const BLACK = vec4(0.,0.,0.,1.);



@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * fnusin(1));
    let startPosition = mouse * ratio;
    //let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr, true); //* .998046;
    //let cell = vec4(2,5,32.,32.);
    let size = vec2(64u,64u);
    let sizeF32 = vec2(f32(size.x),f32(size.y));
    let cellRatio = vec2(sizeF32.x/params.screenWidth,sizeF32.y/params.screenHeight)*ratio;

    let displaceInX = vec2(cellRatio.x, 0);

    var digits = vec4(0.);
    var numberToDecode = params.mouseX;
    let itemsLength = 2;
    for (var index = 0; index < 3; index++) {
        let number = u32(numberToDecode % 10.);
        numberToDecode = floor(numberToDecode / 10.);
        var finalNumber = 10 + number;
        // if(number == 0){
        //     finalNumber = 35;
        // }
        digits += sprite(image, feedbackSampler, startPosition + displaceInX * f32(2-index), uvr, finalNumber, size);
    }
    // -----------------------------------------------
    var digits2 = vec4(0.);
    numberToDecode = params.mouseY;
    let startPosition2 = startPosition - vec2(0, sizeF32.x/params.screenHeight)*ratio;
    for (var index = 0; index < 3; index++) {
        let number = u32(numberToDecode % 10.);
        numberToDecode = floor(numberToDecode / 10.);
        var finalNumber = 10 + number;
        // if(number == 0){
        //     finalNumber = 35;
        // }
        digits2 += sprite(image, feedbackSampler, startPosition2 + displaceInX * f32(2-index), uvr, finalNumber, size);
    }



    let debugTop = showDebugCross(startPosition + vec2(sizeF32.x/params.screenWidth,sizeF32.y/params.screenHeight)*ratio, YELLOW, uv);
    let debugBottom = showDebugCross(startPosition, RED, uv);

    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = digits.g * RED + digits2 * GREEN + debugBottom + debugTop;


    return finalColor;
}
`;

export default frag;
