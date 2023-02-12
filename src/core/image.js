/**
 * places texture in a position
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 */
export const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));

    let minScreenSize = min(params.screenHeight, params.screenWidth);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0, 1);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

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

export const flipTextureUV = /*wgsl*/`
fn flipTextureUV(uv:vec2<f32>) -> vec2<f32>{
    return uv * vec2(1,-1) + vec2(0,1);
}
`;

export const sprite = /*wgsl*/`
fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, index:u32, size:vec2<u32>) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);
    let sizeF32 = vec2<f32>(size);

    let minScreenSize = min(params.screenHeight, params.screenWidth);
    let imageRatio = dimsF32 / minScreenSize;

    let numColumns = (dims.x) / (size.x);

    let x = f32(index % numColumns);
    let y = f32(index / numColumns);
    let cell = vec2(x, y);

    let cellIndex = cell + vec2(0,1);

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
        rgbaImage = vec4(0);
    }

    return rgbaImage;
}
`;

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
    let cellRatio = vec2(sizeF32.x/params.screenWidth,sizeF32.y/params.screenHeight)*ratio;

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