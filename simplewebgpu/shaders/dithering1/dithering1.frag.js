import defaultStructs from '../defaultStructs.js';
import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../defaultFunctions.js';
import { snoise } from '../noise2d.js';

const dithering1Frag = /*wgsl*/`

${defaultStructs}

struct Variable{
    init: i32
}

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${polar}
${snoise}

fn euclideanDistance(color:vec4<f32>, distanceColor:vec4<f32>) -> f32{
    return sqrt(
        pow(color.r - distanceColor.r, 2) +
        pow(color.g - distanceColor.g, 2) +
        pow(color.b - distanceColor.b, 2)
    );
}



fn getClosestColorInPalette(color:vec4<f32>, numPaletteItems:u32) -> vec4<f32> {
    // palette should be a Storage passed from Javascript
    let paletteP = &palette;
    var distance = 1.;
    var selectedColor = vec4(0.);
    for(var i = 0u; i < numPaletteItems; i++){
        let paletteColor = palette[i];
        let currentDistance = euclideanDistance(color, paletteColor);
        if(currentDistance < distance){
            selectedColor = paletteColor;
            distance = currentDistance;
        }
    }

    return selectedColor;
}

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
    rgbaImage = getClosestColorInPalette(rgbaImage, u32(21 * params.sliderB));

    _ = palette[0];

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

    if(variables.init == 0){

        // palette = array< vec4<f32>, 5>(
        //     vec4(0),
        //     vec4(0,1,0,1),
        //     vec4(1,0,0,1),
        //     vec4(0,0,1,1),
        //     vec4(1,1,1,1),
        // );
        palette = array< vec4<f32>, 21>(
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

        variables.init = 1;
    }

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

    return rgbaImage;
}
`;

export default dithering1Frag;
