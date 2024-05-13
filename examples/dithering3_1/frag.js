import { snoise } from 'noise2d';
import { texturePosition } from 'image';
import { fnusin } from 'animation';

const frag = /*wgsl*/`
struct Variable{
    init: i32
}

${fnusin}
${snoise}
${texturePosition}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvRatio: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    //let imageUV = (uv / f + vec2(0, .549 ) ) * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    //var point = textureSample(computeTexture, imageSampler, imageUV); //* .998046;
    var point = texturePosition(computeTexture, imageSampler, vec2(0.), uv / params.scale, true); //* .998046;

    return point;
}
`;

export default frag;
