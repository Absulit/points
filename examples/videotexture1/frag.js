import { fnusin } from 'points/animation';
import { textureExternal, textureExternalPosition } from 'points/image';

const videotexture1Frag = /*wgsl*/`

${textureExternalPosition}
${textureExternal}


@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    // let startPosition = vec2(0.);
    // let rgbaCT = textureExternalPosition(video, feedbackSampler, startPosition, uvr / params.scale, true);

    let rgbaCT = textureExternal(video, feedbackSampler, startPosition, uvr / params.scale, true);

    return rgbaCT;
}
`;

export default videotexture1Frag;
