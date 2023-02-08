import { brightness, fnusin, fusin, polar, sdfCircle, sdfLine, sdfSegment } from '../../src/core/defaultFunctions.js';
import { snoise } from '../../src/core/noise2d.js';
import { PI } from '../../src/core/defaultConstants.js';
import { texturePosition } from '../../src/core/image.js';
import { showDebugCross } from '../../src/core/debug.js';
import { layer } from './../../src/core/color.js';

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
${showDebugCross}
${layer}



fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, cell:vec4<f32>) -> vec4<f32> {
    var startPosition = position;
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));
    let imageRatio = dimsF32.x / params.screenWidth;
    var dimsRatio = dimsF32.x / dimsF32.y;
    var cellPos = cell.xy / dimsF32;
    let cellDim = cell.zw / dimsF32;

    //startPosition.x -= cell.x;
    //startPosition.y = startPosition.y - dimsF32.y/params.screenHeight;
    let distanceFromOrigin = (dimsF32.y/params.screenHeight-(cell.w/params.screenHeight)) ;
    let displaceImagePosition = vec2(startPosition.x - cellPos.x, startPosition.y * dimsRatio - distanceFromOrigin - cellPos.y  + imageRatio) * flipTextureCoordinates;
    //startPosition.y = startPosition.y + dimsF32.y/params.screenHeight;

    var imageUV = uv * vec2(1,dimsRatio);
    imageUV = (imageUV * flipTexture + displaceImagePosition) / imageRatio;
    var rgbaImage3 = textureSample(texture, aSampler, imageUV);


    //cellPos.y = 1 - cellPos.y - cellDim.y;


    let positionCross = showDebugCross(position, vec4(1,0,0,1), uv);
    let displaceCross = showDebugCross(displaceImagePosition, vec4(1,1,0,1), uv);
    let dfoCross = showDebugCross(vec2(0,distanceFromOrigin), vec4(1,0,1,1), uv);

    let isBeyondImageRight = uv.x > startPosition.x + cellDim.x;
    let isBeyondImageLeft = uv.x < startPosition.x;
    let isBeyondTop = uv.y > displaceImagePosition.y;
    let isBeyondBottom = uv.y < startPosition.y;
    let crop = true;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage3 = vec4(0);
    }
    return rgbaImage3 + positionCross + displaceCross + dfoCross;
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
    let startPosition = mouse * ratio;//vec2(.0);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr, true); //* .998046;
    //let rgbaImage = sprite(image, feedbackSampler, startPosition, uvr, vec4(32 * 0,0,32,32)); //* .998046;


    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = rgbaImage;


    return finalColor;
}
`;

export default frag;
