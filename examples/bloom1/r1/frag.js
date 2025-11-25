import { texture } from 'points/image';
import { bloom, brightness } from 'points/color';
import { PI } from 'points/math';

const frag = /*wgsl*/`

${texture}
${bloom}
${PI}
${brightness}

fn gaussian_weight(x: f32, sigma: f32) -> f32 {
    return exp(-0.5 * (x * x) / (sigma * sigma));
}

@fragment
fn main(
        @location(0) color: vec4f,
        @location(1) uv: vec2f,
        @location(2) ratio: vec2f,
        @location(3) uvr: vec2f,
        @location(4) mouse: vec2f,
        @builtin(position) position: vec4f
    ) -> @location(0) vec4f {

    let rgbaImage = texture(feedbackTexture0, imageSampler, uvr, false);

    let luma = brightness(rgbaImage);

    let threshold = .5;
    let intensity = 1.;
    let mask = select(0.0, 1.0, luma > threshold);
    return vec4f(rgbaImage.rgb * mask * intensity, 1.0);
}
`;

export default frag;
