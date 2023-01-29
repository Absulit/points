import defaultStructs from '../../src/shaders/defaultStructs.js';
import { brightness, fnusin, fusin, pixelateTexture } from '../../src/shaders/defaultFunctions.js';
import { snoise } from '../../src/shaders/noise2d.js';
import { getClosestColorInPalette, orderedDithering, orderedDithering_threshold_map } from '../../src/shaders/effects.js';
import { texturePosition } from '../../src/shaders/image.js';

const frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}
${brightness}
${snoise}
${getClosestColorInPalette}
${orderedDithering}
${pixelateTexture}
${texturePosition}

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


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    //let imageUV = (uv / f + vec2(0, .549 ) ) * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    //var point = textureSample(computeTexture, feedbackSampler, imageUV); //* .998046;
    var point = texturePosition(computeTexture, feedbackSampler, vec2(0.), uv / params.sliderA, false); //* .998046;

    return point;
}
`;

export default frag;
