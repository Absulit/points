import { texture } from 'points/image';
import { rand } from 'points/random';
const frag = /*wgsl*/`

${texture}
${rand}

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

    rand_seed = uvr + params.time;

    let noise = rand() * .5 + .5;
    let finalColor = (feedbackTextureColor + feedbackTextureColor * noise) * .5;

    return finalColor;
}
`;

export default frag;
