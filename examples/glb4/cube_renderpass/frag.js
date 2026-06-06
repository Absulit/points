import { fnusin } from 'points/animation';

const frag = /*wgsl*/`

${fnusin}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let albedoColor = textureSample(albedo, imageSampler, in.uv);

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(in.uvr.x  * cellSize) * sin(in.uvr.y * cellSize);
    let b = sin(in.uvr.x * in.uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(in.uvr.x * in.uvr.y * 10.);
    let d = distance(a,b);
    let f = d * in.uvr.x * in.uvr.y;
    var baseColor = vec4(a*d, f*c*a, f, 1.);


    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(in.normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    baseColor = albedoColor;
    if(params.color_mode == 2){
        baseColor = vec4(a*f, d*c*f, f, 1);
    }
    let finalColor = baseColor.rgb * diffuse; // how much of the color is diffused

    return vec4f(finalColor, in.color.a);
}
`;

export default frag;
