import { fnusin } from 'animation';
import { texturePosition } from 'image';

const frag = /*wgsl*/`

${fnusin}
${texturePosition}



fn texturePosition2(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2u= textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0., 1.);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    if(crop){
        let isBeyondImageRight = uv.x > position.x + imageRatio.x;
        let isBeyondImageLeft = uv.x < position.x;
        let isBeyondTop =  uv.y > top.y ;
        let isBeyondBottom = uv.y < position.y;
        if((isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
            rgbaImage = vec4(0.);
        }
    }

    return rgbaImage;
}


@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let center = vec2f(.5) * ratio;

    let textColors = texturePosition2(textImg, imageSampler, center, uvr, true);

    return textColors;
}
`;

export default frag;
