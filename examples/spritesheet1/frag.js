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

const RED = vec4(1.,0.,0.,1.);
const GREEN = vec4(0.,1.,0.,1.);
const BLUE = vec4(0.,0.,1.,1.);

const YELLOW = vec4(1.,1.,0.,1.);
const CYAN = vec4(0.,1.,1.,1.);
const MAGENTA = vec4(1.,0.,1.,1.);

const WHITE = vec4(1.,1.,1.,1.);
const BLACK = vec4(0.,0.,0.,1.);

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
    let startPosition = vec2(.5,.5) * ratio;
    //let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr, true); //* .998046;
    let cell = vec4(2,5,32.,32.);
    let rgbaImage = sprite(image, feedbackSampler, startPosition, uvr, 27, vec2(32,32)); //* .998046;

    let debugTop = showDebugCross(startPosition + vec2(cell.z/params.screenWidth,cell.w/params.screenHeight)*ratio, YELLOW, uv);
    let debugBottom = showDebugCross(startPosition, RED, uv);

    //let finalColor:vec4<f32> = vec4(brightness(rgbaImage));
    let finalColor:vec4<f32> = rgbaImage + debugBottom + debugTop;


    return finalColor;
}
`;

export default frag;
