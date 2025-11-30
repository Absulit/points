import { fnusin } from 'points/animation';
import { brightness } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
${brightness}
${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let lines = sin(in.uv.x * (in.uv.x + 3. * fnusin(1.))) ;
    let rgbaImage = texture(
        image,
        feedbackSampler,
        in.uvr * lines / params.scale,
        false
    );

    let b = brightness(rgbaImage);

    let finalColor:vec4f = vec4(b);

    return finalColor;
}
`;

export default frag;
