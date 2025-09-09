import { fnusin } from 'points/animation';
import { brightness } from 'points/color';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
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

    let lines = sin(uv.x * (uv.x + 3. * fnusin(1.))) ;
    let rgbaImage = texture(
        image,
        feedbackSampler,
        uvr * lines / params.scale,
        false
    );

    let b = brightness(rgbaImage);

    let finalColor:vec4f = vec4(b);

    return finalColor;
}
`;

export default frag;
