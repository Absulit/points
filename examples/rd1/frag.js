import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}


@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    // let uv = pos.xy / vec2f(textureDimensions(inputTex, 0));

    // Sample neighbors for diffusion
    let offset = 1. / vec2f(textureDimensions(inputTex, 0));
    let center = textureSample(inputTex, imageSampler, uv);
    let north  = textureSample(inputTex, imageSampler, uv + vec2f(0, offset.y));
    let south  = textureSample(inputTex, imageSampler, uv - vec2f(0, offset.y));
    let east   = textureSample(inputTex, imageSampler, uv + vec2f(offset.x, 0));
    let west   = textureSample(inputTex, imageSampler, uv - vec2f(offset.x, 0));

    // Simple diffusion (blur)
    let diffusion = (north + south + east + west - 4.0 * center) * 0.25;

    // Nonlinear reaction (e.g., threshold or oscillation)
    let reaction = sin(center.r * 10. + params.time) * 0.05;

    // Combine
    let result = center + diffusion + vec4f(reaction, reaction, reaction, 0.0);

    return clamp(result, vec4f(), vec4f(1));
}
`;

export default frag;
