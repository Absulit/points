import { fnusin } from 'points/animation';
import { structs } from './structs.js';

const frag = /*wgsl*/`

${fnusin}
${structs}

@fragment
fn main(
    @location(0) color: vec4f,
    @location(1) uv: vec2f,
    @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2f,    // uv with aspect ratio corrected
    @location(4) mouse: vec2f,
    @location(5) normal: vec3f,
    @interpolate(flat) @location(6) id: u32,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    let baseColor = vec4f(1);
    let finalColor = baseColor.rgb * diffuse; // how much of the color is diffused

    return vec4f(finalColor, 1);
}
`;

export default frag;
