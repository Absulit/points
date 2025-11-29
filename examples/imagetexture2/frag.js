import { brightness } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${brightness}
${texture}

const WAVENUMBER = 8;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let color0 = vec4(params.color0 / 255, 1.);
    let color1 = vec4(params.color1 / 255, 1.);

    let rgbaImage = texture(image, feedbackSampler, in.uvr / params.scale, false);

    let b = brightness(rgbaImage);
    let d = distance(in.uv, rgbaImage.xy);

    let finalColor = mix(color0, color1, b) * sin(d * WAVENUMBER + params.time) ;

    return finalColor;
}
`;

export default frag;
