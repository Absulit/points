import defaultStructs from '../../src/shaders/defaultStructs.js';
import { brightness, brightnessB, brightnessC, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../../src/shaders/defaultFunctions.js';
import { snoise } from '../../src/shaders/noise2d.js';
import { PI } from '../../src/shaders/defaultConstants.js';
import { RGBAFromHSV } from '../../src/shaders/color.js';
import { texturePosition } from '../../src/shaders/image.js';

const frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${brightnessB}
${brightnessC}
${polar}
${snoise}
${PI}
${RGBAFromHSV}
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

    let n1 = snoise(uv * fnusin(1));

    let scale = 6.;
    let rgbaImage = texturePosition(image, vec2(0.), uv * scale / params.sliderA, false); //* .998046;
    let rgbaMask = texturePosition(mask, vec2(0.), uv * scale / params.sliderA, false); //* .998046;
    let b = brightness(rgbaImage);

    let mask = 1-rgbaMask.g;
    let d = 1 - distance(vec2(.5), uv);
    let rings = sin( d * 100 + params.utime) ;

    //let finalColor:vec4<f32> = vec4();
    let finalColor:vec4<f32> = RGBAFromHSV(b + fract(params.utime * .1), 1, 1);
    //let finalColor:vec4<f32> = RGBAFromHSV(rgbaImage.g * 2 + fract(params.utime * .1), 1, 1);
    //let finalColor:vec4<f32> = mix( RGBAFromHSV(params.sliderA, 1, 1), RGBAFromHSV(params.sliderB, 1, 1) , params.sliderC  );
    //let finalColor:vec4<f32> = mix( RGBAFromHSV(params.sliderA, 1, 1), RGBAFromHSV(params.sliderB, 1, 1) , b  );
    // let finalColor:vec4<f32> = mix( RGBAFromHSV(b + .5 + fract(params.utime), 1, 1), RGBAFromHSV(b + fract(params.utime), 1, 1) , b  );



    return vec4(finalColor.rgb, mask);
    //return vec4(b);
    //return vec4(rgbaImage);
    //return vec4(b);
    //return vec4(rings);
}
`;

export default frag;
