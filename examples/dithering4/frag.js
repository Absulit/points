import { snoise } from 'noise2d';
import { PI } from 'math';
import { texturePosition } from 'image';
import { fnusin } from 'points/animation';
import { brightness } from 'color';

const frag = /*wgsl*/`

${fnusin}
${brightness}
${snoise}

const numPaletteItems = 21;

${PI}
${texturePosition}


const N = 2.;

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let n1 = snoise(uv * 2 + 2 * fnusin(1./3));

    let dims: vec2<u32> = textureDimensions(image, 0);
    let dimsF = vec2(f32(dims.x),f32(dims.y));
    var dimsRatio = f32(dims.x) / f32(dims.y);
    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.scale;
    let startPosition = vec2(0.);
    var rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr, true); //* .998046;
    //var rgbaImage = pixelateTexture(image, feedbackSampler, 10,10, imageUV);
    let b = brightness(rgbaImage);
    var newBrightness = 0.;

    if(b > .5){
        newBrightness = 1.;
    }
    let quant_error = b - newBrightness;


    let texelSize = imageUV / dimsF;

    let rgbaImageRight = texturePosition(image, feedbackSampler, startPosition, uvr + vec2(texelSize.x, 0), true);
    let bRight = brightness(rgbaImageRight) + (.5 * quant_error);

    let rgbaImageLeft = texturePosition(image, feedbackSampler, startPosition, uvr + vec2(-texelSize.x, 0), true);
    let bLeft = brightness(rgbaImageLeft) + (.5 * quant_error);

    let rgbaImageTop = texturePosition(image, feedbackSampler, startPosition, uvr + vec2(0, -texelSize.y), true);
    let bTop = brightness(rgbaImageTop) + (.5 * quant_error);

    let rgbaImageBottom = texturePosition(image, feedbackSampler, startPosition, uvr + vec2(0, texelSize.y), true);
    let bBottom = brightness(rgbaImageBottom) + (.5 * quant_error);

    let fb = (b + bRight + bLeft + bTop + bBottom) / 5 * params.distance;
    newBrightness = 0.;
    if(fb > .5){
        newBrightness = 1.;
    }

    rgbaImage = vec4(newBrightness);


    return rgbaImage;
}
`;

export default frag;
