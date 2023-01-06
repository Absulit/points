import defaultStructs from '../defaultStructs.js';
import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';

const dithering1Frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${polar}
${snoise}

// this._threshold_map = [
//     [1, 9, 3, 11],
//     [13, 5, 15, 7],
//     [4, 12, 2, 10],
//     [16, 8, 14, 6]
// ];

// orderedDithering(depth = 32, threshold_map) {
//     this._threshold_map = threshold_map || this._threshold_map;
//     const screen = this._screen;
//     for (let cIndex = 0; cIndex < screen.numColumns; cIndex++) {
//         for (let rowIndex = 0; rowIndex < screen.numRows; rowIndex++) {
//             const point = screen.getPointAt(cIndex, rowIndex);

//             let b = this._threshold_map[cIndex % 4][rowIndex % 4];


//             point.setColor(
//                 (point.color.r + b / depth | 0) * depth,
//                 (point.color.g + b / depth | 0) * depth,
//                 (point.color.b + b / depth | 0) * depth,
//             );
//         }
//     }
// }


@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv + 2 * fnusin(1));

    let dims: vec2<u32> = textureDimensions(image, 0);
    var dimsRatio = f32(dims.x) / f32(dims.y);
    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    var rgbaImage = textureSample(image, feedbackSampler, imageUV); //* .998046;
    //rgbaImage = vec4(brightness(rgbaImage));

    // from 8 to 40
    //let depth = floor(8 + 32. * fnusin(1));
    let depth = floor(8 + 32. * params.sliderB);
    let threshold_map = array< f32, 16>(
        1, 9, 3, 11,
        13, 5, 15, 7,
        4, 12, 2, 10,
        16, 8, 14, 6
    );
    // let threshold_map = array< f32, 4>(
    //     0, 2,
    //     3, 1,
    // );

    let t = threshold_map[ i32(imageUV.x + (imageUV.y * f32(dims.x)) % depth * 32.) ];

    var r = (rgbaImage.r + t / depth);
    if(r < 1){
        r = 0;
    }
    var g =  (rgbaImage.g + t / depth);
    if(g < 1){
        g = 0;
    }
    var b =  (rgbaImage.b + t / depth);
    if(b < 1){
        b = 0;
    }
    let ditheredImage = vec4(
        r * depth,
        g * depth,
        b * depth,
        1,
    );

    //let finalColor:vec4<f32> = vec4(b);

    return ditheredImage;
}
`;

export default dithering1Frag;
