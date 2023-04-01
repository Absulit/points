import { fnusin } from '../../src/core/defaultFunctions.js';
import { texturePosition } from '../../src/core/image.js';

const videotexture1Frag = /*wgsl*/`

${fnusin}
${texturePosition}


@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let dims: vec2<u32> = textureDimensions(image, 0);
    var dimsRatio = f32(dims.x) / f32(dims.y);

    let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    let lines = sin( uv.x*(uv.x + 3 * fnusin(1))  ) ;
    let startPosition = vec2(0.);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, imageUV, false); //* .998046;

    let rgbaCT = texturePosition(computeTexture, feedbackSampler, startPosition, uv / params.sliderA, false);

    return rgbaCT;
}
`;

export default videotexture1Frag;
