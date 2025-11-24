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

    let rgbaImage = texture(image, imageSampler, uvr / params.scale, false);

    let luma = brightness(rgbaImage);


    // let bloomVal = bloom(input, i32(params.bloom_iterations), params.bloom_amount);
    // let rgbaBloom = vec4(bloomVal);

    // let finalColor:vec4f = rgbaImage + rgbaBloom;


    // let luma = dot(color.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
    let threshold = .5;
    let intensity = 1.;
    let mask = select(0.0, 1.0, luma > threshold);
    return vec4<f32>(rgbaImage.rgb * mask * intensity, 1.0);
}
`;

export default frag;
