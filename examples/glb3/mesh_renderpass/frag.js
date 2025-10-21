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
    @location(5) normal: vec3f,
    @location(6) world: vec3f,
    @interpolate(flat) @location(7) id: u32,
    @builtin(position) position: vec4f
) -> @location(0) vec4f {

    let albedoColor = textureSample(albedo, imageSampler, uv);

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uvr.x  * cellSize) * sin(uvr.y * cellSize);
    let b = sin(uvr.x * uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(uvr.x * uvr.y * 10.);
    let d = distance(a,b);
    let f = d * uvr.x * uvr.y;
    var baseColor = vec4(a*d, f*c*a, f, 1.);


    let ambient = vec3f(.1, .1, .1); // ambient color

    let lightDirection = vec3f(fnusin(.6) -.5, fnusin(1) -5, fnusin(1.3) * -1);
    let N = normalize(normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    let viewDir = normalize(params.cameraPosition + world); // direction to camera
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

    return vec4f(finalColor, color.a);
}
`;

export default frag;
