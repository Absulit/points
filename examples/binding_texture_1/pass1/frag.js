import { texture } from 'points/image';
import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}
${texture}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let renderLayer0Color = texture(renderLayer0, imageSampler, uvr, true);
    let bColor = texture(b, imageSampler, uvr, true);
    let finalColor = renderLayer0Color + bColor * .1;

    return finalColor;
}
`;

export default frag;
