import { fusin } from 'points/animation';
import { texturePosition } from 'points/image';

const frag = /*wgsl*/`

${texturePosition}
${fusin}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texturePosition(image, imageSampler, vec2(0.,0), uvr, true);

    let finalColor = imageColor;

    return finalColor;
}
`;

export default frag;
