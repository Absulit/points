import { fnusin } from 'points/animation';
import { bloom, brightness, layer, RED, WHITE } from 'points/color';
import { TAU, PI, rotateVector, polar } from 'points/math';
import { snoise } from 'points/noise2d';
import { sdfLine, sdfSegment } from 'points/sdf';
import { pixelateTexturePosition, texturePosition } from 'points/image';
import { rand } from 'points/random';
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
${rand}
${pixelateTexturePosition}
${bloom}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    let imageColor = texturePosition(feedbackTexture, imageSampler, vec2(0,0), uvr, false);
    let b = brightness(imageColor);
    let bloomVal = bloom(b, i32(10.), params.sliderC);
    let rgbaBloom = vec4(bloomVal);

    let finalColor:vec4<f32> = imageColor + rgbaBloom;

    // return WHITE * b;
    return finalColor;
}
`;

export default frag;
