import { brightness, fnusin, fusin, pixelateTexture } from '../../src/shaders/defaultFunctions.js';
import { snoise } from '../../src/shaders/noise2d.js';
import { getClosestColorInPalette, orderedDithering, orderedDithering_threshold_map } from '../../src/shaders/effects.js';
import { PI } from '../../src/shaders/defaultConstants.js';
import { texturePosition } from '../../src/shaders/image.js';

const frag = /*wgsl*/`

${fnusin}
${fusin}
${brightness}
${snoise}
${getClosestColorInPalette}
${orderedDithering}
${pixelateTexture}

${orderedDithering_threshold_map}

const numPaletteItems = 21;
const getClosestColorInPalette_palette = array< vec4<f32>, numPaletteItems>(
    vec4(255./255, 69./255, 0, 1.),
    vec4(255./255, 168./255, 0, 1.),
    vec4(255./255, 214./255, 53./255, 1.),
    vec4(0, 204./255, 120./255, 1.),
    vec4(126./255, 237./255, 86./255, 1.),
    vec4(0./255, 117./255, 111./255, 1.),
    vec4(0./255, 158./255, 170./255, 1.),
    vec4(36./255, 80./255, 164./255, 1.),
    vec4(54./255, 144./255, 234./255, 1.),
    vec4(81./255, 233./255, 244./255, 1.),
    vec4(73./255, 58./255, 193./255, 1.),
    vec4(106./255, 92./255, 255./255, 1.),
    vec4(129./255, 30./255, 159./255, 1.),
    vec4(180./255, 74./255, 192./255, 1.),
    vec4(255./255, 56./255, 129./255, 1.),
    vec4(255./255, 153./255, 170./255, 1.),
    vec4(109./255, 72./255, 48./255, 1.),
    vec4(156./255, 105./255, 38./255, 1.),
    vec4(0, 0, 0, 1.),
    vec4(137./255, 141./255, 144./255, 1.),
    vec4(212./255, 215./255, 217./255, 1.),
);

${PI}
${texturePosition}


const N = 2.;

@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * 2 + 2 * fnusin(1/3));

    let dims: vec2<u32> = textureDimensions(image, 0);
    let dimsF = vec2(f32(dims.x),f32(dims.y));
    var dimsRatio = f32(dims.x) / f32(dims.y);
    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    let startPosition = vec2(0.);
    var rgbaImage = texturePosition(image, feedbackSampler, startPosition, uv, true); //* .998046;
    //var rgbaImage = pixelateTexture(image, feedbackSampler, 10,10, imageUV);
    let b = brightness(rgbaImage);
    var newBrightness = 0.;

    if(b > .5){
        newBrightness = 1.;
    }
    let quant_error = b - newBrightness;


    let texelSize = imageUV / dimsF;

    let rgbaImageRight = texturePosition(image, feedbackSampler, startPosition, uv + vec2(texelSize.x, 0), true);
    let bRight = brightness(rgbaImageRight) + (.5 * quant_error);

    let rgbaImageLeft = texturePosition(image, feedbackSampler, startPosition, uv + vec2(-texelSize.x, 0), true);
    let bLeft = brightness(rgbaImageLeft) + (.5 * quant_error);

    let rgbaImageTop = texturePosition(image, feedbackSampler, startPosition, uv + vec2(0, -texelSize.y), true);
    let bTop = brightness(rgbaImageTop) + (.5 * quant_error);

    let rgbaImageBottom = texturePosition(image, feedbackSampler, startPosition, uv + vec2(0, texelSize.y), true);
    let bBottom = brightness(rgbaImageBottom) + (.5 * quant_error);

    let fb = (b + bRight + bLeft + bTop + bBottom) / 5 * params.sliderC;
    newBrightness = 0.;
    if(fb > .5){
        newBrightness = 1.;
    }

    rgbaImage = vec4(newBrightness);


    return rgbaImage;
}
`;

export default frag;
