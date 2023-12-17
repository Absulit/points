import { fusin } from "../../../src/core/animation.js";
import { texturePosition } from "../../../src/core/image.js";

const frag = /*wgsl*/`

${texturePosition}
${fusin}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(image, imageSampler, vec2(0,0), uvr, true);
    // first render pass doesn't use the feedback texture, it's the second pass
    // _ = texturePosition(feedbackTexture, feedbackSampler, vec2(0,0), uvr, true);

    let d = distance(uvr, vec2(.5 + .1 * fusin(2.), .5  + .1 * fusin(4.123)));
    var c = 1.;
    if(d > .1){
        c = 0.;
    }

    let finalColor = imageColor + c * vec4(1);

    return finalColor;
}
`;

export default frag;
