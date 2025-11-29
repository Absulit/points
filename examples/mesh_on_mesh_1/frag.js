import { structs } from './structs.js';
import { RED } from 'points/color';

const frag = /*wgsl*/`

${structs}
${RED}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(in.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    var baseColor = vec4f(1);

    var alpha = 1.;
    if(mesh.base_mesh == id){
        alpha = 1.;
        baseColor = RED;
    }
    let finalColor = baseColor.rgb * diffuse; // how much of the color is diffused

    return vec4f(finalColor, alpha);
}
`;

export default frag;
