import { fnusin } from 'points/animation';
import { layer, RED, WHITE } from 'points/color';
import { TAU, PI, rotateVector, polar } from 'points/math';
import { snoise } from 'points/noise2d';
import { sdfLine, sdfSegment, sdfSmooth } from 'points/sdf';
import { decodeNumberSprite, sprite, textureExternalPosition, texturePosition } from 'points/image';
const frag = /*wgsl*/`

${sdfSegment}
${sdfLine}
${rotateVector}
${PI}
${TAU}
${polar}
${snoise}
${layer}
${RED}
${texturePosition}
${textureExternalPosition}
${sprite}
${decodeNumberSprite}
${WHITE}
${sdfSmooth}



@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let scale = .2 * ratio;
    // let scale = params.sliderC;

    let feedbackTextureColor = texturePosition(feedbackTexture, imageSampler, vec2(0.) * ratio, uvr, true);


    // let imageColor = texturePosition(image, imageSampler, vec2(0,0), uvr / scale, true);
    let imageColor = textureExternalPosition(image, imageSampler, vec2(0,0), uvr / scale, true);
    let feedbackTextureColor1 = texturePosition(feedbackTexture1, imageSampler, vec2(1,0), uvr / scale, true);
    let feedbackTextureColor2 = texturePosition(feedbackTexture2, imageSampler, vec2(2,0), uvr / scale, true);
    let feedbackTextureColor3 = texturePosition(feedbackTexture3, imageSampler, vec2(3,0), uvr / scale, true);
    let feedbackTextureColor4 = texturePosition(feedbackTexture4, imageSampler, vec2(4,0), uvr / scale, true);


    let images = layer(layer(layer(layer(layer(feedbackTextureColor, imageColor), feedbackTextureColor1), feedbackTextureColor2), feedbackTextureColor3), feedbackTextureColor4);
    // let images = feedbackTextureColor1;


    let scaleDigits = .25;
    let startPosition = vec2(.3, 0) * ratio * scaleDigits;
    let start0char = 16u;
    let size = vec2(8u,22u);

    var digits = RED * decodeNumberSprite(params.sliderA * 100, start0char, text, imageSampler, startPosition, uvr * scaleDigits, ratio, size).r;
    digits += RED * decodeNumberSprite(params.sliderB * 100, start0char, text, imageSampler, startPosition + vec2(.05 * 3,0), uvr * scaleDigits, ratio, size).r;
    digits += RED * decodeNumberSprite(params.sliderC * 100, start0char, text, imageSampler, startPosition + vec2(.05 * 2,0), uvr * scaleDigits, ratio, size).r;
    digits = sdfSmooth(digits);


    return layer(images, digits);
}
`;

export default frag;
