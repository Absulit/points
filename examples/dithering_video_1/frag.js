import { snoise } from 'points/noise2d';
import { texturePosition } from 'points/image';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`
struct Variable{
    init: i32
}

${fnusin}
${snoise}
${texturePosition}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvRatio: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    //let imageUV = (uv / f + vec2(0, .549 ) ) * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    //var point = textureSample(computeTexture, imageSampler, imageUV); //* .998046;
    var point = texturePosition(computeTexture, imageSampler, vec2(0.), uv / params.scale, false); //* .998046;

    return point;
}
`;

export default frag;
