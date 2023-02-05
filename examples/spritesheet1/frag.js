import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../../src/core/defaultFunctions.js';
import { snoise } from '../../src/core/noise2d.js';
import { PI } from '../../src/core/defaultConstants.js';
import { texturePosition } from '../../src/core/image.js';

const frag = /*wgsl*/`

${fnusin}
${fusin}
${sdfCircle}
${sdfSegment}
${sdfLine}
${brightness}
${polar}
${snoise}
${PI}
${texturePosition}

fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, cell:vec4<f32>) -> vec4<f32> {
    let startPosition = position;
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));
    let imageRatio = dimsF32.x / params.screenWidth;

    let displaceImagePosition = vec2(startPosition.x, startPosition.y + imageRatio) * flipTextureCoordinates;

    var imageUV = (uv * flipTexture + displaceImagePosition) / imageRatio;
    var rgbaImage3 = textureSample(texture, aSampler, imageUV);

    var cellPos = cell.xy / dimsF32;
    let cellDim = cell.zw / dimsF32;
    //cellPos.y = 1 - cellPos.y - cellDim.y;

    let isBeyondImageRight = imageUV.x > startPosition.x + cellPos.x + cellDim.x;
    let isBeyondImageLeft = imageUV.x < startPosition.x + cellPos.x;
    let isBeyondTop = imageUV.y > startPosition.y + cellPos.y +  cellDim.y;
    let isBeyondBottom = imageUV.y < startPosition.y + cellPos.y;
    let crop = true;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage3 = vec4(0);
    }
    return rgbaImage3;
}


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

    let n1 = snoise(uv * fnusin(1));

    // let dims: vec2<u32> = textureDimensions(image, 0);
    // var dimsRatio = f32(dims.x) / f32(dims.y);

    //let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.x / params.sliderA;
    //let oldKingUVClamp = uv * vec2(1,1 * dimsRatio) * ratio.x;
    let startPosition = vec2(.0);
    //let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr / params.sliderA, false); //* .998046;
    let rgbaImage = sprite(image, feedbackSampler, startPosition, uvr / params.sliderA, vec4(62 * 1,0,62,62)); //* .998046;


    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = rgbaImage;


    return finalColor;
}
`;

export default frag;
