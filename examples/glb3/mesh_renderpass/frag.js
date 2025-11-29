import { fnusin } from 'points/animation';
import { structs } from '../structs.js';

const frag = /*wgsl*/`

${structs}
${fnusin}

@fragment
fn main(in: FragmentCustom) -> @location(0) vec4f {

    let albedoColor = textureSample(albedo, imageSampler, in.uv);

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(in.uvr.x  * cellSize) * sin(in.uvr.y * cellSize);
    let b = sin(in.uvr.x * in.uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(in.uvr.x * in.uvr.y * 10.);
    let d = distance(a,b);
    let f = d * in.uvr.x * in.uvr.y;
    var baseColor = vec4(a*d, f*c*a, f, 1.);


    let ambient = vec3f(.1, .1, .1); // ambient color

    let lightDirection = vec3f(fnusin(.6) -.5, fnusin(1) -5, fnusin(1.3) * -1);
    let N = normalize(in.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    let viewDir = normalize(params.cameraPosition + in.world); // direction to camera
    let reflectDir = reflect(L, N); // reflected light direction
    let specularStrength = .5;
    let shininess = 32.0;

    let specular = pow(max(dot(viewDir, reflectDir), 0.0), shininess) * specularStrength;
    let specularColor = vec3f(1., 1., 1.);


    baseColor = albedoColor;
    if(params.color_mode == 2){
        baseColor = vec4(a*f, d*c*f, f, 1);
    }
    let finalColor = ambient + baseColor.rgb * diffuse + specularColor * specular;

    return vec4f(finalColor, in.color.a);
}
`;

export default frag;
