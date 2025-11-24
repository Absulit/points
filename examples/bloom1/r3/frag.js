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

        // params for later
        // texelSize: vec2<f32>; // 1.0 / bloomTextureSize
        // radius: i32;          // e.g., 8–16
        // sigma: f32;           // e.g., radius / 2.0
        let texelSize = vec2f(1) / 1.001;
        let radius = 8;
        let sigma = f32(radius) / 2.;

        var sum = vec3f(0.0);
        var norm = 0.0;

        // center tap
        let w0 = gaussian_weight(0.0, sigma);
        let c = textureSample(feedbackTexture2, imageSampler, uv).rgb;
        sum += c * w0;
        norm += w0;

        // paired taps top/bottom
        for (var i: i32 = 1; i <= radius; i = i + 1) {
            let offset = f32(i);
            let w = gaussian_weight(offset, sigma);

            let uvD = uv + vec2f(0.0, -offset * texelSize.y);
            let uvU = uv + vec2f(0.0,  offset * texelSize.y);

            sum += textureSample(feedbackTexture2, imageSampler, uvD).rgb * w;
            sum += textureSample(feedbackTexture2, imageSampler, uvU).rgb * w;
            norm += 2.0 * w;
        }

        let blurred = sum / max(norm, 1e-6);
        return vec4f(blurred, 1.0);
}

`;

export default frag;
