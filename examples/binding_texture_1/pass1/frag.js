import { texture } from 'points/image';
import { layer } from 'points/color';

const frag = /*wgsl*/`

${texture}
${layer}

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
    let finalColor = layer(
        bColor,
        vec4f(renderLayer0Color.rgb, renderLayer0Color.r)
    );

    return finalColor;
}
`;

export default frag;
