import { fnusin } from 'points/animation';
import { texture } from 'points/image';

const frag = /*wgsl*/`

${fnusin}
${texture}


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

    let flippedUV = vec2f(uv.x, 1. - uv.y);
    let albedoColor = texture(albedo, imageSampler, flippedUV, false);

    let cellSize = 20. + 10. * fnusin(1.);
    let a = sin(uvr.x  * cellSize) * sin(uvr.y * cellSize);
    let b = sin(uvr.x * uvr.y * 10. * 9.1 * .25 );
    let c = fnusin(uvr.x * uvr.y * 10.);
    let d = distance(a,b);
    let f = d * uvr.x * uvr.y;
    var baseColor = vec4(a*d, f*c*a, f, 1.);


    let lightDirection = vec3f(-.5,-1,-1);
    let N = normalize(normal);
    let L = normalize(-lightDirection);
    let diffuse = max(dot(N, L), 0.0); // Lambertian term

    baseColor = albedoColor;
    if(params.color_mode == 2){
        baseColor = vec4(a*f, d*c*f, f, 1);
    }
    let finalColor = baseColor.rgb * diffuse; // how much of the color is diffused

    return vec4f(finalColor, color.a);
}
`;

export default frag;
