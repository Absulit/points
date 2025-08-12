import { texture } from 'points/image';
import { brightness } from 'points/color';

const frag = /*wgsl*/`

${brightness}
${texture}

const numPaletteItems = 21;

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let dims = vec2f(textureDimensions(image, 0));
    let dimsRatio = dims.x / dims.y;
    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.scale;
    var rgbaImage = texture(image, feedbackSampler, uvr, true);
    let b = brightness(rgbaImage);
    var newBrightness = step(.5, b); // if(b > .5){newBrightness = 1.;}

    let quant_error = b - newBrightness;

    let texelSize = imageUV / dims;

    let rgbaImageRight = texture(image, feedbackSampler, uvr + vec2(texelSize.x, 0), true);
    let bRight = brightness(rgbaImageRight) + (.5 * quant_error);

    let rgbaImageLeft = texture(image, feedbackSampler, uvr + vec2(-texelSize.x, 0), true);
    let bLeft = brightness(rgbaImageLeft) + (.5 * quant_error);

    let rgbaImageTop = texture(image, feedbackSampler, uvr + vec2(0, -texelSize.y), true);
    let bTop = brightness(rgbaImageTop) + (.5 * quant_error);

    let rgbaImageBottom = texture(image, feedbackSampler, uvr + vec2(0, texelSize.y), true);
    let bBottom = brightness(rgbaImageBottom) + (.5 * quant_error);

    let fb = (b + bRight + bLeft + bTop + bBottom) / 5 * params.distance;
    newBrightness = step(.5, fb); // if(fb > .5){ newBrightness = 1.;}

    rgbaImage = vec4(newBrightness);

    return rgbaImage;
}
`;

export default frag;
