/**
 * places texture in a position
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 */
export const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let startPosition = position;
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let imageRatio = f32(dims.x) / params.screenWidth;
    var dimsRatio = f32(dims.x) / f32(dims.y);

    let displaceImagePosition = vec2(startPosition.x, startPosition.y + imageRatio) * flipTextureCoordinates;

    var imageUV = uv * vec2(1,dimsRatio);
    imageUV = (imageUV * flipTexture + displaceImagePosition) / imageRatio;
    if(!crop){
        imageUV = fract(imageUV);
    }

    var rgbaImage = textureSample(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > startPosition.x + imageRatio;
    let isBeyondImageLeft = uv.x < startPosition.x;
    let isBeyondTop = uv.y > startPosition.y +  imageRatio;
    let isBeyondBottom = uv.y < startPosition.y;
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