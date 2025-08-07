import { fnusin } from 'points/animation';
import { brightness } from 'points/color';
import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
${brightness}
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

    let lines = sin( uv.x*(uv.x + 3. * fnusin(1.))  ) ;
    let startPosition = vec2(0.);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr * lines / params.scale, false); //* .998046;

    let b = brightness(rgbaImage);

    let finalColor:vec4f = vec4(b);


    return finalColor;
}
`;

export default frag;
