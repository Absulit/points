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

const RED = vec4(1,0,0,1);
const GREEN = vec4(0,1,0,1);
const BLUE = vec4(0,0,1,1);

const YELLOW = vec4(1,1,0,1);
const CYAN = vec4(0,1,1,1);
const MAGENTA = vec4(1,0,1,1);

const WHITE = vec4(1,1,1,1);
const BLACK = vec4(0,0,0,1);

fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, cell:vec4<f32>) -> vec4<f32> {
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
    let crop = false;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage = vec4(0);
    }

    return rgbaImage;
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
    //let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr, true); //* .998046;
    let rgbaImage = sprite(image, feedbackSampler, startPosition, uvr, vec4(32 * 0,0,32,32)); //* .998046;


    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = rgbaImage;


    return finalColor;
}
`;

export default frag;
