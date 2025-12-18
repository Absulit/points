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

fn reinhardToneMap(color : vec3f) -> vec3f {
    // Reinhard operator: color / (1 + color)
    return color / (vec3f(1.0) + color);
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

        // params for later
        // texelSize: vec2f; // 1.0 / bloomTextureSize
        // radius: i32;          // e.g., 8-16
        // sigma: f32;           // e.g., radius / 2.0
        let texelSize = vec2f(1) / params.bloomTextureSize;
        let radius = i32(params.radius);
        let sigma = params.radius / 2.;

        var sum = vec3f(0.0);
        var norm = 0.0;

        // center tap
        let w0 = gaussian_weight(0.0, sigma);
        let c = textureSample(feedbackTexture2, imageSampler, in.uv).rgb;
        sum += c * w0;
        norm += w0;

        // paired taps top/bottom
        for (var i: i32 = 1; i <= radius; i++) {
            let offset = f32(i);
            let w = gaussian_weight(offset, sigma);

            let uvD = in.uv + vec2f(0.0, -offset * texelSize.y);
            let uvU = in.uv + vec2f(0.0,  offset * texelSize.y);

            sum += textureSample(feedbackTexture2, imageSampler, uvD).rgb * w;
            sum += textureSample(feedbackTexture2, imageSampler, uvU).rgb * w;
            norm += 2.0 * w;
        }

        let blurred = sum / max(norm, 1e-6);

        let ft0 = texture(feedbackTexture0, imageSampler, in.uvr, true);

        // return ft0 + vec4f(blurred, 1.0) * params.bloom;
        let t = reinhardToneMap(ft0.rgb + blurred * params.bloom);
        // let t = tanh(ft0.rgb + blurred * params.bloom);
        // let t = tanh((ft0.rgb + blurred * params.bloom)/3e1);

        return vec4f(t, 1);
}

`;

export default frag;
