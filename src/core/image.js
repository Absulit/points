/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/image
 */

/**
 * places texture in a position
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f`
 */
export const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0., 1.);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > position.x + imageRatio.x;
    let isBeyondImageLeft = uv.x < position.x;
    let isBeyondTop =  uv.y > top.y ;
    let isBeyondBottom = uv.y < position.y;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * places texture_external in a position
 * @type {String}
 * @param {texture_external} texture `texture_external`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f
 */
export const textureExternalPosition = /*wgsl*/`
fn textureExternalPosition(texture:texture_external, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0, 1);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSampleBaseClampToEdge(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > position.x + imageRatio.x;
    let isBeyondImageLeft = uv.x < position.x;
    let isBeyondTop =  uv.y > top.y ;
    let isBeyondBottom = uv.y < position.y;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage = vec4(0);
    }

    return rgbaImage;
}
`;

/**
 * Flips texture in Y. This because it comes flipped, so this corrects it.
 * @type {String}
 * @param {vec2f} uv uv coordinates
 * @return `vec2f`
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
 * @return `vecff`
 */
export const sprite = /*wgsl*/`
fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, index:u32, size:vec2<u32>) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);
    let sizeF32 = vec2<f32>(size);

    let minScreenSize = min(params.screen.y, params.screen.x);
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
 * @type {String}
 * @param {f32} value
 * @param {u32} index0Char
 * @param {texture_2d<f32>} image
 * @param {sampler} imageSampler
 * @param {vec2f} position
 * @param {vec2f} uv
 * @param {vec2f} ratio
 * @param {vec2u} size
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
 * Increase the aparent pixel size of the texture image using `textureSample`
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
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
 * Increase the aparent pixel size of the texture image using `texturePosition`
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
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
