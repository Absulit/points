import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(in.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    let finalColor = in.color.rgb * diffuse; // how much of the color is diffused

    return vec4f(finalColor, in.color.a);
}
`;

export default frag;
