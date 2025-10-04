import { fnusin } from 'points/animation';
import { structs } from '../structs.js';

const frag = /*wgsl*/`

${fnusin}
${structs}


@fragment
fn main(
    input: CustomFragment
) -> @location(0) vec4f {

    let depth = clamp(input.depth.r * 8, 0, 1);
    let baseColor = vec4f(input.color.rgb * (1-depth), 1);

    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(input.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    let finalColor = baseColor.rgb * diffuse; // how much of the color is diffused

    return vec4f(finalColor, baseColor.a);

}
`;

export default frag;
