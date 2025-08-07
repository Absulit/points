import { fnusin } from 'points/animation';
import { brightness } from 'points/color';
import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
${brightness}
${texturePosition}

@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let lines = sin( uv.x*(uv.x + 3. * fnusin(1.))  ) ;
    let startPosition = vec2(0.);
    let rgbaImage = texturePosition(image, feedbackSampler, startPosition, uvr * lines / params.scale, false); //* .998046;

    let b = brightness(rgbaImage);

    let finalColor:vec4<f32> = vec4(b);


    return finalColor;
}
`;

export default frag;
