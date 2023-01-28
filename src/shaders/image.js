/**
 * places texture in a position
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 */
export const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let startPosition = position;
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims3: vec2<u32> = textureDimensions(texture, 0);
    let imageRatio3 = f32(dims3.x) / params.screenWidth;

    let displaceImagePosition = vec2(startPosition.x, startPosition.y + imageRatio3) * flipTextureCoordinates;

    var imageUV3 = (uv * flipTexture + displaceImagePosition) / imageRatio3;
    if(!crop){
        imageUV3 = fract(imageUV3);
    }

    var rgbaImage3 = textureSample(texture, feedbackSampler, imageUV3);

    let isBeyondImageRight = uv.x > startPosition.x + imageRatio3;
    let isBeyondImageLeft = uv.x < startPosition.x;
    let isBeyondTop = uv.y > startPosition.y +  imageRatio3;
    let isBeyondBottom = uv.y < startPosition.y;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage3 = vec4(0);
    }
    return rgbaImage3;
}
`;

export const flipTextureUV = /*wgsl*/`
fn flipTextureUV(uv:vec2<f32>) -> vec2<f32>{
    return uv * vec2(1,-1) + vec2(0,1);
}
`;