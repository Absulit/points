import { sdfCircle } from 'points/sdf';
import { structs } from '../structs.js';

const frag = /*wgsl*/`

${structs}
${sdfCircle}

@fragment
fn main(
    input: CustomFragment
) -> @location(0) vec4f {

    let depth = clamp(input.depth.r * 8, 0, 1);
    let baseColor = vec4f(input.color.rgb * (1-depth), 1);

    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(input.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.); // Lambertian term

    let lambert = baseColor.rgb * diffuse; // how much of the color is diffused

    var finalColor = lambert;
    if(params.lambert == 0){
        finalColor = baseColor.rgb;
    }

    let c = sdfCircle(vec2f(.5), .5, .0, input.uv);

    let circleColor = vec4f(finalColor * c, baseColor.a * c);

    return circleColor;
}
`;

export default frag;
