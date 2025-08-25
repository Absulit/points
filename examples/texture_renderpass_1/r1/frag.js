import { brightness } from 'points/color';
import { texture } from 'points/image';
const frag = /*wgsl*/`

${texture}
${brightness}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let feedbackTextureColor = texture(
        feedbackTexture,
        imageSampler,
        uvr,
        false
    );
    let b = brightness(feedbackTextureColor);

    return vec4(vec3(b), 1);
}
`;

export default frag;
