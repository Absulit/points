import { brightness } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${brightness}
${texture}


@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let color0 = vec4(params.color0/255, 1.);
    let color1 = vec4(params.color1/255, 1.);

    let rgbaImage = texture(image, feedbackSampler, uvr / params.scale, false);

    let b = brightness(rgbaImage);
    let d = distance(uv, rgbaImage.xy);

    let finalColor = mix(color0, color1, b) * sin(d * 8 + params.time) ;

    return finalColor;
}
`;

export default frag;
