import { fnusin } from 'points/animation';
import { brightness } from 'points/color';
import { polar } from 'points/math';
import { snoise } from 'points/noise2d';
import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
${brightness}
${polar}
${snoise}
${texturePosition}


@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

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

    //let finalColor:vec4f = vec4(b);
    let finalColor:vec4f = mix(  color0, color1, b) * fnusin(d);
    //let finalColor:vec4f = rgbaImage;


    return finalColor;
}
`;

export default frag;
