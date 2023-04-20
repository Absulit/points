import { fusin } from "../../../src/core/animation.js";
import { texturePosition } from "../../../src/core/image.js";

const frag = /*wgsl*/`

${texturePosition}
${fusin}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screenWidth and params.screenHeight
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(image, imageSampler, vec2(0,0), uvr, true);

    let finalColor = imageColor;

    return finalColor;
}
`;

export default frag;
