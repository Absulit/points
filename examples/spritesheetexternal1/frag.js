import { texturePosition } from 'points/image';
import { sdfLine2, sdfSegment } from 'sdf';

const frag = /*wgsl*/`

${texture}
${texturePosition}
${sdfLine2}
${sdfSegment}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let scale = 4.;
    let center = vec2f(.5) * ratio;

    let dims = vec2f(textureDimensions(textImg, 0));
    let imageWidth = dims / params.screen * ratio; // if you are using uvr you have to multiply by ratio
    let halfImageWidth = imageWidth * .5 * scale;

    let textColors = texture(textImg, imageSampler, (uvr / scale) - (center - halfImageWidth) / scale, true);

    return textColors;
}
`;

export default frag;
