import { layer, RED } from 'points/color';
import { rotateVector } from 'points/math';
import { sdfSmooth } from 'points/sdf';
import {
    decodeNumberSprite,
    sprite,
    textureExternal,
    texture
} from 'points/image';

const frag = /*wgsl*/`

${rotateVector}
${layer}
${RED}
${texture}
${textureExternal}
${sprite}
${decodeNumberSprite}
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

    let feedbackTextureColor = texture(feedbackTexture, imageSampler, uvr, true);


    // let imageColor = texture(image, imageSampler, vec2(0,0), uvr / scale, true);
    let imageColor = textureExternal(image, imageSampler, uvr / scale, true);
    let feedbackTextureColor1 = texture(feedbackTexture1,
        imageSampler,
        (uvr / scale) - vec2(1, 0),
        true
    );
    let feedbackTextureColor2 = texture(feedbackTexture2,
        imageSampler,
        (uvr / scale) - vec2(2, 0),
        true
    );
    let feedbackTextureColor3 = texture(feedbackTexture3,
        imageSampler,
        (uvr / scale) - vec2(3, 0),
        true
    );
    let feedbackTextureColor4 = texture(feedbackTexture4,
        imageSampler,
        (uvr / scale) - vec2(4, 0),
        true
    );

    var images = layer(feedbackTextureColor, imageColor);
    images = layer(images, feedbackTextureColor1);
    images = layer(images, feedbackTextureColor2);
    images = layer(images, feedbackTextureColor3);
    images = layer(images, feedbackTextureColor4);

    let scaleDigits = .25;
    let startPosition = vec2(.3, 0) * ratio * scaleDigits;
    let start0char = 16u;
    let size = vec2(8u,22u);

    var digits = RED * decodeNumberSprite(
        params.sliderA * 100,
        start0char,
        text,
        imageSampler,
        startPosition,
        uvr * scaleDigits,
        ratio, size
    ).r;
    digits += RED * decodeNumberSprite(
        params.sliderB * 100, start0char,
        text, imageSampler,
        startPosition + vec2(.05 * 3, 0),
        uvr * scaleDigits,
        ratio,
        size
    ).r;
    digits += RED * decodeNumberSprite(
        params.sliderC * 100,
        start0char,
        text,
        imageSampler,
        startPosition + vec2(.05 * 2,0),
        uvr * scaleDigits,
        ratio,
        size
    ).r;
    digits = sdfSmooth(digits);

    return layer(images, digits);
}
`;

export default frag;
