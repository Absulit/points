/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/image
 */

/**
 * Places a texture. The texture being an image loaded from the JS side.
 * @type {String}
 * places texture
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 *
 * // js
 * import { texture } from 'points/image';
 *
 * await points.setTextureImage('image', 'myimage.jpg');
 *
 * // wgsl string
 * ${texture}
 * let value = texture(image, imageSampler, uvr, true);
 */
export const texture = /*wgsl*/`
fn texture(texture:texture_2d<f32>, aSampler:sampler, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2u = textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition =  vec2(0., 1.);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;

    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * @type {String}
 * places texture in a position
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 * @deprecated
 *
 * @example
 * // js
 * import { texturePosition } from 'points/image';
 *
 * await points.setTextureImage('image', 'myimage.jpg');
 *
 * // wgsl string
 * ${texturePosition}
 * let value = texturePosition(image, imageSampler, vec2f(), uvr, true);
 */
export const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0., 1.);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * @type {String}
 * places texture_external in a position
 * @param {texture_external} texture `texture_external`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f
 */
export const textureExternal = /*wgsl*/`
fn textureExternal(texture:texture_external, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0, 1);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSampleBaseClampToEdge(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * Places texture_external in a position. Texture external being in this case
 * a video loaded as texture in the JS side.
 * @type {String}
 * @param {texture_external} texture `texture_external`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { textureExternalPosition } from 'points/image';
 * await points.setTextureVideo('video', 'myvideo.mp4');
 *
 * // wgsl string
 * ${textureExternalPosition}
 * let value = textureExternalPosition(video, imageSampler, vec2f(), uvr, true);
 */
export const textureExternalPosition = /*wgsl*/`
fn textureExternalPosition(texture:texture_external, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0, 1);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSampleBaseClampToEdge(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * Flips texture in Y. This because it comes flipped, so this corrects it.
 * @type {String}
 * @param {vec2f} uv uv coordinates
 * @returns {vec2f}
 *
 * @example
 * // js
 * import { flipTextureUV } from 'points/image';
 *
 * // wgsl string
 * ${flipTextureUV}
 * let value = flipTextureUV(uvr);
 */
export const flipTextureUV = /*wgsl*/`
fn flipTextureUV(uv:vec2<f32>) -> vec2<f32>{
    return uv * vec2(1,-1) + vec2(0,1);
}
`;

/**
 * Sprite or Atlas. Extract a piece of the sprite with an index.
 * @type {String}
 * @param {texture_2d<f32>} texture texture to sample
 * @param {sampler} aSampler a sampler
 * @param {vec2f} position coordiantes where the image will be printed
 * @param {vec2f} uv uv coordinates
 * @param {vec2f} index position in the atlas: e.g. `0` is the first
 * @param {vec2f} size dimensions of the cell: e.g. `32x32px`
 * @return {vec4f}
 *
 * @example
 * // js
 * import { sprite } from 'points/image';
 *
 * // wgsl string
 * ${sprite}
 * let value = sprite(texture, imageSampler, vec2f(), uvr, 0, vec2(8u,22u) );
 */
export const sprite = /*wgsl*/`
fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, index:u32, size:vec2<u32>) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);
    let sizeF32 = vec2<f32>(size);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let numColumns = (dims.x) / (size.x);

    let x = f32(index % numColumns);
    let y = f32(index / numColumns);
    let cell = vec2(x, y);

    let cellIndex = cell + vec2(0,1.);

    let cellSize = sizeF32 / minScreenSize;
    let cellSizeInImage = cellSize / imageRatio;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + cellIndex * cellSizeInImage;
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > position.x + cellSize.x;
    let isBeyondImageLeft = uv.x < position.x;
    let isBeyondTop =  uv.y > position.y + cellSize.y;
    let isBeyondBottom = uv.y < position.y;
    if(isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight){
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * From a provided number, get the sprite in an atlas that matches the value.
 * @type {String}
 * @param {f32} value number to decode
 * @param {u32} index0Char starting index of the 0 char, this is an offset
 * @param {texture_2d<f32>} image sprite or atlas to get the chars from
 * @param {sampler} imageSampler
 * @param {vec2f} position
 * @param {vec2f} uv
 * @param {vec2f} ratio screen ratio, this is the default ratio parameter from the main function
 * @param {vec2u} size size in pixels
 *
 * @example
 * // js
 * import { decodeNumberSprite } from 'points/image';
 *
 * // wgsl string
 * ${decodeNumberSprite}
 * let value = decodeNumberSprite(numberToDecode, start0char, image, position, startPosition, uvr, ratio, size);
 */
export const decodeNumberSprite = /*wgsl*/`
fn decodeNumberSprite(
    value:f32,
    index0Char:u32,
    image:texture_2d<f32>,
    imageSampler:sampler,
    position:vec2<f32>,
    uv:vec2<f32>,
    ratio:vec2<f32>,
    size:vec2<u32>
) -> vec4<f32> {

    let sizeF32 = vec2(f32(size.x),f32(size.y));
    let cellRatio = vec2(sizeF32.x/params.screen.x,sizeF32.y/params.screen.y)*ratio;

    let displaceInX = vec2(cellRatio.x, 0);

    var digits = vec4(0.);
    var numberToDecode = value;
    for (var index = 0; numberToDecode >= 1.; index++) {
        let number = u32(numberToDecode % 10.);
        numberToDecode = numberToDecode / 10.;
        let finalNumber = index0Char + number;
        digits += sprite(image, imageSampler, position + displaceInX * f32(-index), uv, finalNumber, size);
    }
    return digits;
}
`;

/**
 * Increase the aparent pixel size of the texture image using `textureSample`.
 * This reduces the quality of the image.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2f} uv `vec2<f32>`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { pixelateTexture } from 'points/image';
 *
 * // wgsl string
 * ${pixelateTexture}
 * let value = pixelateTexture(image, imageSampler, 10,10, uvr);
 */
export const pixelateTexture = /*wgsl*/`
fn pixelateTexture(texture:texture_2d<f32>, textureSampler:sampler, pixelsWidth:f32, pixelsHeight:f32, uv:vec2<f32>) -> vec4<f32> {
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    return textureSample(texture, textureSampler, coord);
}
`;

/**
 * Increase the aparent pixel size of the texture image using `texturePosition`.
 * This reduces the quality of the image.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { pixelateTexturePosition } from 'points/image';
 *
 * // wgsl string
 * ${pixelateTexturePosition}
 * let value = pixelateTexturePosition(image, imageSampler, vec2f(), 10,10, uvr);
 */
export const pixelateTexturePosition = /*wgsl*/`
fn pixelateTexturePosition(texture:texture_2d<f32>, textureSampler:sampler, position:vec2<f32>, pixelsWidth:f32, pixelsHeight:f32, uv:vec2<f32>) -> vec4<f32> {
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    //texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    return texturePosition(texture, textureSampler, position, coord, true);
}
`;
