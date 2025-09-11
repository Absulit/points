import { texture } from 'points/image';
import { structs } from './structs.js';

const frag = /*wgsl*/`

${structs}
${texture}

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
    let center = texture(inputTex, imageSampler, uvr, true);
    let north  = texture(inputTex, imageSampler, uvr + vec2f(0, offset.y), true);
    let south  = texture(inputTex, imageSampler, uvr - vec2f(0, offset.y), true);
    let east   = texture(inputTex, imageSampler, uvr + vec2f(offset.x, 0), true);
    let west   = texture(inputTex, imageSampler, uvr - vec2f(offset.x, 0), true);

    // Simple diffusion (blur)
    let diffusion = (north + south + east + west - 4.0 * center) * 0.25;

    // Nonlinear reaction (e.g., threshold or oscillation)
    let reaction = sin(center.r * 10. + params.time) * diffusion.x + .00165;

    // Combine
    var startColor = texture(startTexture, imageSampler, uvr, true);
    // if(variables.init == 1){
    //     startColor = vec4f();
    // }
    var result = center + diffusion + vec4f(reaction, reaction, reaction, 0.0);

    let decay = max(0.001, exp(-params.time * .156)); // .98 .156 or any decay curve
    result = mix(result, startColor, decay);
    // variables.init = 1;

    return clamp(result, vec4f(), vec4f(1));
}
`;

export default frag;
