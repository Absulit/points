import { fnusin } from 'points/animation';
import { brightness } from 'color';
import { polar } from 'math';
import { snoise } from 'noise2d';
import { texturePosition } from 'image';

const frag = /*wgsl*/`

${fnusin}
${brightness}
${polar}
${snoise}
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

    let n1 = snoise(uv * 10.);
    let color0 = vec4(params.color0/255, 1.);
    let color1 = vec4(params.color1/255, 1.);

    let dims: vec2<u32> = textureDimensions(image, 0);
    var dimsRatio = f32(dims.x) / f32(dims.y);

    // let imageUV = uv * vec2(1,-1 * dimsRatio) * ratio.y / params.sliderA;
    //let oldKingUVClamp = uv * vec2(1,1 * dimsRatio) * ratio.x;
    let startPosition = vec2(.0);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr / params.scale, false); //* .998046;

    let b = brightness(rgbaImage);
    let d = distance(uv, rgbaImage.xy);

    //let finalColor:vec4<f32> = vec4(b);
    let finalColor:vec4<f32> = mix(  color0, color1, b) * fnusin(d);
    //let finalColor:vec4<f32> = rgbaImage;


    return finalColor;
}
`;

export default frag;
