import { fnusin } from 'points/animation';
import { brightness, layer, RED, WHITE } from 'points/color';
import { TAU, PI, rotateVector, polar } from 'points/math';
import { snoise } from 'points/noise2d';
import { sdfLine, sdfSegment } from 'points/sdf';
import { texturePosition } from 'points/image';
const frag = /*wgsl*/`

${sdfSegment}
${sdfLine}
${rotateVector}
${PI}
${TAU}
${polar}
${snoise}
${layer}
${RED}
${WHITE}
${texturePosition}
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


    let feedbackTextureColor = texturePosition(feedbackTexture, imageSampler, vec2(0,0), uvr, false);
    let b = brightness(feedbackTextureColor);

    let finalColor = vec4(1.);

    // return WHITE * b;
    return vec4(vec3(b), 1);
}
`;

export default frag;
