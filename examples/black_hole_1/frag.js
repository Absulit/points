import { texture } from 'points/image';

const frag = /*wgsl*/`

${texture}


fn impactParameter(r:f32, M:f32) -> f32 {
    return r / sqrt(1 - (2 * M) / r);
}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {


    let center = mouse * ratio;

    let r = length(uvr - center);
    let b = impactParameter(r, params.mass);
    // let strength = 1.0 / b; // Inverse: closer rays bend more
    let strength = exp(-b * params.falloffFactor);
    let bendDir = normalize(center - uv);
    let distortedUV = uvr + bendDir * strength * params.distortionScale;

    let b_photon = 5.196 * params.mass;

    var finalColor = texture(image, imageSampler, distortedUV, false);

    let ringGlow = smoothstep(b_photon - params.ε, b_photon + params.ε, b);
    finalColor += ringGlow * vec4f(1.0, 0.9, 0.7, 1); // Warm glow


    if ( b < b_photon) {
        finalColor = vec4f();
    }




    return finalColor;
}
`;

export default frag;
