import { bloom, brightness } from 'points/color';
import { texture } from 'points/image';
import { PI } from 'points/math';
const frag = /*wgsl*/`

${texture}
${brightness}
${bloom}
${PI}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let imageColor = texture(feedbackTexture, imageSampler, uvr, false);
    let b = brightness(imageColor);
    let bloomVal = bloom(b, i32(10.), params.sliderC);
    let rgbaBloom = vec4(bloomVal);

    let finalColor = imageColor + rgbaBloom;

    return finalColor;
}
`;

export default frag;
